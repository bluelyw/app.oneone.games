import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()
    
    // 构建回调URL，包含next参数
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const redirectTo = `${appUrl}/auth/callback?next=/account`

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo
      }
    })

    if (error) {
      console.error('Sign in error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to send magic link' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Magic link sent to your email. Please check your inbox and click the link to complete sign in.'
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
