import { NextResponse } from 'next/server'
import { createServerSupabaseClientWithServiceRole } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const { userId, priceId, type } = await request.json()
    
    if (!userId || !priceId || !type) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    const supabase = createServerSupabaseClientWithServiceRole()

    // 模拟 checkout.session.completed 事件
    const checkoutSession = {
      id: 'cs_test_' + Date.now(),
      customer: 'cus_test_' + Date.now(),
      subscription: type === 'subscription' ? 'sub_test_' + Date.now() : null,
      payment_intent: 'pi_test_' + Date.now(),
      amount_total: type === 'subscription' ? 199 : 299,
      currency: 'usd',
      metadata: {
        user_id: userId,
        type: type
      }
    }

    let membership = null

    // 处理会员状态更新
    if (type === 'subscription') {
      // 创建或更新订阅会员
      const { data: membershipData, error: membershipError } = await supabase
        .from('memberships')
        .upsert({
          user_id: userId,
          stripe_subscription_id: checkoutSession.subscription,
          stripe_customer_id: checkoutSession.customer,
          status: 'active',
          type: 'subscription',
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天后
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,stripe_subscription_id'
        })

      if (membershipError) {
        console.error('Error creating membership:', membershipError)
        return NextResponse.json({ 
          error: '创建会员失败', 
          details: membershipError.message,
          code: membershipError.code 
        }, { status: 500 })
      }

      membership = membershipData
    }

    // 创建购买记录
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        user_id: userId,
        stripe_session_id: checkoutSession.id,
        stripe_payment_intent_id: checkoutSession.payment_intent,
        amount: checkoutSession.amount_total,
        currency: checkoutSession.currency,
        status: 'completed',
        product_name: type === 'subscription' ? 'Membership Subscription' : 'One-time Payment',
        created_at: new Date().toISOString()
      })

    if (purchaseError) {
      console.error('Error creating purchase:', purchaseError)
      return NextResponse.json({ error: '创建购买记录失败' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '模拟 webhook 处理成功',
      membership: membership,
      purchase: purchase
    })

  } catch (error) {
    console.error('Error simulating webhook:', error)
    return NextResponse.json({ 
      error: '服务器错误',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
