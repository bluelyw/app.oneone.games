import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: '邮箱地址是必需的' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()
    
    // 构建回调URL，包含next参数
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const redirectTo = `${appUrl}/auth/callback?next=/account`

    console.log('Sending magic link with redirectTo:', redirectTo)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo
      }
    })

    if (error) {
      console.error('Sign in error:', error)
      return NextResponse.json(
        { error: error.message || '发送魔法链接失败' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: '魔法链接已发送到您的邮箱，请查收并点击链接完成登录'
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
