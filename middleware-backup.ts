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
  
  // 简单测试：直接重定向到登录页
  console.log('🚫 Middleware: Redirecting to login for testing')
  return NextResponse.redirect(new URL('/login', request.url))
}

export const config = {
  matcher: [
    /*
     * 匹配所有以 /games/premium/ 开头的路径
     */
    '/games/premium/:path*',
  ],
}
