import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    
    // 获取当前用户
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ 
        authenticated: false,
        message: '用户未登录'
      })
    }

    // 检查会员状态
    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('status, type, current_period_end')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email
      },
      membership: membership || null,
      membershipError: membershipError?.message || null,
      message: membership ? '用户已登录且是活跃会员' : '用户已登录但不是活跃会员'
    })

  } catch (error) {
    console.error('Middleware test error:', error)
    return NextResponse.json({ 
      error: '服务器错误',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
