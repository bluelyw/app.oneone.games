import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    
    // 测试数据库连接
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    if (error) {
      return NextResponse.json(
        { 
          error: '数据库连接失败',
          details: error.message 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: '数据库连接正常',
      tables: ['profiles', 'memberships', 'purchases']
    })

  } catch (error) {
    return NextResponse.json(
      { 
        error: '数据库连接异常',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}
