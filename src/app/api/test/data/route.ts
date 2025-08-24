import { NextResponse } from 'next/server'
import { createServerSupabaseClientWithServiceRole } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = createServerSupabaseClientWithServiceRole()
    
    // 获取所有会员数据
    const { data: memberships, error: membershipsError } = await supabase
      .from('memberships')
      .select('*')
      .order('created_at', { ascending: false })

    // 获取所有购买记录
    const { data: purchases, error: purchasesError } = await supabase
      .from('purchases')
      .select('*')
      .order('created_at', { ascending: false })

    // 获取所有用户档案
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    return NextResponse.json({
      memberships: memberships || [],
      purchases: purchases || [],
      profiles: profiles || [],
      errors: {
        memberships: membershipsError?.message,
        purchases: purchasesError?.message,
        profiles: profilesError?.message
      }
    })

  } catch (error) {
    console.error('Error fetching data:', error)
    return NextResponse.json({ 
      error: '服务器错误',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
