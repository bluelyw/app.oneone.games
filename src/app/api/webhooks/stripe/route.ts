import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClientWithServiceRole } from '@/lib/supabase-server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      console.error('Missing Stripe signature')
      return NextResponse.json(
        { error: '缺少 Stripe 签名' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Webhook 签名验证失败' },
        { status: 400 }
      )
    }

    console.log('Received webhook event:', event.type)

    const supabase = createServerSupabaseClientWithServiceRole()

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session, supabase)
          break

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, supabase)
          break

        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabase)
          break

        case 'invoice.payment_succeeded':
          await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice, supabase)
          break

        case 'invoice.payment_failed':
          await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice, supabase)
          break

        default:
          console.log(`Unhandled event type: ${event.type}`)
      }

      return NextResponse.json({ received: true })

    } catch (error) {
      console.error('Error processing webhook:', error)
      return NextResponse.json(
        { error: '处理 Webhook 事件失败' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook 处理失败' },
      { status: 500 }
    )
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, supabase: any) {
  const userId = session.metadata?.user_id
  const type = session.metadata?.type

  console.log('Processing checkout session:', session.id, 'for user:', userId, 'type:', type)

  if (!userId || !type) {
    console.error('Missing user_id or type in session metadata')
    return
  }

  // 幂等性检查：检查是否已经处理过这个 session
  const { data: existingPurchase } = await supabase
    .from('purchases')
    .select('id')
    .eq('stripe_session_id', session.id)
    .single()

  if (existingPurchase) {
    console.log('Session already processed:', session.id)
    return
  }

  // 创建购买记录（所有类型的支付都需要）
  await supabase.from('purchases').insert({
    user_id: userId,
    stripe_session_id: session.id,
    stripe_payment_intent_id: session.payment_intent as string,
    amount: session.amount_total || 0,
    currency: session.currency || 'usd',
    status: 'completed',
    product_name: type === 'subscription' ? 'Membership Subscription' : 'One-time Payment',
    created_at: new Date().toISOString()
  })

  if (type === 'subscription') {
    // 处理订阅
    const subscription = session.subscription as Stripe.Subscription
    if (subscription) {
      console.log('Processing subscription:', subscription.id, 'status:', subscription.status)
      
      // 先检查是否已有该用户的会员记录
      const { data: existingMembership } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (existingMembership) {
        // 更新现有记录
        const { data: result, error } = await supabase
          .from('memberships')
          .update({
            status: subscription.status,
            type: 'subscription',
            current_period_end: (subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000).toISOString() : null,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .select()

        if (error) {
          console.error('Error updating membership:', error)
        } else {
          console.log('Successfully updated membership:', result)
        }
      } else {
        // 创建新记录
        const { data: result, error } = await supabase
          .from('memberships')
          .insert({
            user_id: userId,
            status: subscription.status,
            type: 'subscription',
            current_period_end: (subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000).toISOString() : null,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()

        if (error) {
          console.error('Error creating membership:', error)
        } else {
          console.log('Successfully created membership:', result)
        }
      }
    }
  }

  console.log('Successfully processed checkout session:', session.id)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabase: any) {
  // 幂等性检查：检查订阅是否已存在且状态相同
  const { data: existingMembership } = await supabase
    .from('memberships')
    .select('status, updated_at')
    .eq('stripe_subscription_id', subscription.id)
    .single()

  if (existingMembership && existingMembership.status === subscription.status) {
    console.log('Subscription status unchanged:', subscription.id)
    return
  }

  // 查找用户ID
  const { data: membership } = await supabase
    .from('memberships')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single()

  if (!membership) {
    console.error('Membership not found for subscription:', subscription.id)
    return
  }

  await supabase.from('memberships').upsert({
    user_id: membership.user_id,
    status: subscription.status,
    type: 'subscription',
    current_period_end: (subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000).toISOString() : null,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer as string,
    updated_at: new Date().toISOString(),
  })

  console.log('Successfully updated subscription:', subscription.id)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any) {
  await supabase
    .from('memberships')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)

  console.log('Successfully canceled subscription:', subscription.id)
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice, supabase: any) {
  if ((invoice as any).subscription) {
    const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string)
    await handleSubscriptionUpdated(subscription, supabase)
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice, supabase: any) {
  if ((invoice as any).subscription) {
    const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string)
    await handleSubscriptionUpdated(subscription, supabase)
  }
}
