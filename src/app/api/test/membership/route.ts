import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    
    // 获取当前用户
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: '用户未登录' }, { status: 401 })
    }

    // 获取会员状态
    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // 获取购买记录
    const { data: purchases, error: purchasesError } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      },
      membership: membership || [],
      purchases: purchases || [],
      errors: {
        membership: membershipError?.message,
        purchases: purchasesError?.message
      }
    })

  } catch (error) {
    console.error('Error checking membership:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
