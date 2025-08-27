import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServerSupabaseClientWithServiceRole } from '@/lib/supabase-server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // 获取当前用户
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: '用户未登录' }, { status: 401 })
    }

    // 获取用户的最新活跃订阅
    const { data: memberships, error: membershipError } = await supabase
      .from('memberships')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)

    if (membershipError || !memberships || memberships.length === 0) {
      return NextResponse.json({ error: '未找到活跃订阅' }, { status: 404 })
    }

    const membership = memberships[0]

    if (!membership.stripe_subscription_id) {
      return NextResponse.json({ error: '订阅ID不存在' }, { status: 400 })
    }

    let subscription = null
    let stripeError = null

    // 尝试在 Stripe 中立即取消订阅
    try {
      subscription = await stripe.subscriptions.cancel(
        membership.stripe_subscription_id
      )
    } catch (error: any) {
      console.error('Stripe subscription update error:', error)
      stripeError = error
      
      // 如果 Stripe 订阅不存在，我们仍然可以更新数据库状态
      if (error.code === 'resource_missing') {
        console.log('Stripe subscription not found, updating database only')
      } else {
        // 其他 Stripe 错误，返回错误
        return NextResponse.json({ 
          error: 'Stripe 订阅操作失败',
          details: error.message 
        }, { status: 500 })
      }
    }

    // 更新数据库中的订阅状态（使用 service role 客户端绕过 RLS）
    const supabaseService = createServerSupabaseClientWithServiceRole()
    
    console.log('Updating membership ID:', membership.id, 'from status:', membership.status, 'to canceled')
    
    const { data: updateResult, error: updateError } = await supabaseService
      .from('memberships')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', membership.id)
      .select()

    if (updateError) {
      console.error('Error updating membership:', updateError)
      return NextResponse.json({ error: '更新订阅状态失败' }, { status: 500 })
    }

    console.log('Membership update result:', updateResult)

    // 根据是否成功更新 Stripe 返回不同的消息
    if (subscription) {
      return NextResponse.json({
        success: true,
        message: '订阅已立即取消',
        subscription: {
          id: subscription.id,
          status: subscription.status
        }
      })
    } else {
      return NextResponse.json({
        success: true,
        message: '订阅已立即取消（本地状态已更新）',
        note: 'Stripe 订阅不存在，仅更新了本地状态'
      })
    }

  } catch (error) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json({ error: '取消订阅失败' }, { status: 500 })
  }
}
