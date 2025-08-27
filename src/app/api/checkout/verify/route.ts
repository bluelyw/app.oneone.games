import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServerSupabaseClientWithServiceRole } from '@/lib/supabase-server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: '缺少 sessionId 参数' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '用户未登录' }, { status: 401 })
    }

    // 获取 checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription']
    })

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: '支付未完成' }, { status: 400 })
    }

    // 检查是否已经处理过
    const { data: existingPurchase } = await supabase
      .from('purchases')
      .select('id')
      .eq('stripe_session_id', sessionId)
      .single()

    if (existingPurchase) {
      return NextResponse.json({ 
        success: true, 
        message: '支付已处理',
        alreadyProcessed: true 
      })
    }

    // 手动处理 webhook 逻辑
    const supabaseService = createServerSupabaseClientWithServiceRole()
    const userId = session.metadata?.user_id
    const type = session.metadata?.type

    if (!userId || !type) {
      return NextResponse.json({ error: '缺少用户信息' }, { status: 400 })
    }

    // 创建购买记录
    await supabaseService.from('purchases').insert({
      user_id: userId,
      stripe_session_id: sessionId,
      stripe_payment_intent_id: session.payment_intent as string,
      amount: session.amount_total || 0,
      currency: session.currency || 'usd',
      status: 'completed',
      product_name: type === 'subscription' ? 'Membership Subscription' : 'One-time Payment',
      created_at: new Date().toISOString()
    })

    if (type === 'subscription') {
      const subscription = session.subscription as Stripe.Subscription
      if (subscription) {
        // 检查是否已有会员记录
        const { data: existingMembership } = await supabaseService
          .from('memberships')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (existingMembership) {
          // 更新现有记录
          await supabaseService
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
        } else {
          // 创建新记录
          await supabaseService
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
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: '支付验证完成，会员状态已更新',
      session: {
        id: session.id,
        subscription: typeof session.subscription === 'string' ? session.subscription : session.subscription?.id,
        status: session.status
      }
    })

  } catch (error) {
    console.error('Error verifying checkout:', error)
    return NextResponse.json({ 
      error: '验证支付失败',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
