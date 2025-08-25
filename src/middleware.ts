import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  console.log('🔍 Middleware triggered for:', request.nextUrl.pathname)
  
  // 只处理 /games/premium/* 路由
  if (!request.nextUrl.pathname.startsWith('/games/premium/')) {
    console.log('⏭️ Middleware: Not a premium game route, skipping')
    return NextResponse.next()
  }

  console.log('🎮 Middleware: Processing premium game route')

  try {
    // 创建 Supabase 客户端
    let supabaseResponse = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // 检查用户是否登录
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log('🚫 Middleware: User not logged in, redirecting to /login')
      return NextResponse.redirect(new URL('/login', request.url))
    }

    console.log('✅ Middleware: User authenticated:', user.email)

    // 检查用户是否有活跃会员
    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (membershipError || !membership) {
      console.log('🚫 Middleware: User not a member, redirecting to /billing')
      return NextResponse.redirect(new URL('/billing', request.url))
    }

    // 用户已登录且是活跃会员，允许访问
    console.log('✅ Middleware: User authorized, allowing access')
    return NextResponse.next()

  } catch (error) {
    console.error('❌ Middleware error:', error)
    // 发生错误时，为了安全起见，重定向到登录页
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    '/games/premium/:path*',
  ],
}
