import { NextResponse } from 'next/server'
import { createServerSupabaseClientWithServiceRole } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: '缺少用户ID' }, { status: 400 })
    }

    const supabase = createServerSupabaseClientWithServiceRole()

    // 删除测试创建的会员记录（保留最早的记录）
    const { data: memberships, error: membershipsError } = await supabase
      .from('memberships')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (membershipsError) {
      return NextResponse.json({ error: '获取会员记录失败' }, { status: 500 })
    }

    // 保留最早的记录，删除其他记录
    if (memberships && memberships.length > 1) {
      const recordsToDelete = memberships.slice(1) // 删除除第一条外的所有记录
      
      for (const record of recordsToDelete) {
        await supabase
          .from('memberships')
          .delete()
          .eq('id', record.id)
      }
    }

    // 删除测试创建的购买记录（保留最早的记录）
    const { data: purchases, error: purchasesError } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (purchasesError) {
      return NextResponse.json({ error: '获取购买记录失败' }, { status: 500 })
    }

    // 保留最早的记录，删除其他记录
    if (purchases && purchases.length > 1) {
      const recordsToDelete = purchases.slice(1) // 删除除第一条外的所有记录
      
      for (const record of recordsToDelete) {
        await supabase
          .from('purchases')
          .delete()
          .eq('id', record.id)
      }
    }

    return NextResponse.json({
      success: true,
      message: '测试数据清理完成',
      deleted: {
        memberships: memberships ? memberships.length - 1 : 0,
        purchases: purchases ? purchases.length - 1 : 0
      }
    })

  } catch (error) {
    console.error('Error cleaning up test data:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
