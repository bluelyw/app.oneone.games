import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  console.log('🔍 Test middleware triggered for:', request.nextUrl.pathname)
  
  // 只处理 /games/premium/* 路由
  if (!request.nextUrl.pathname.startsWith('/games/premium/')) {
    console.log('⏭️ Test middleware: Not a premium game route, skipping')
    return NextResponse.next()
  }
  
  console.log('🎮 Test middleware: Processing premium game route')
  
  // 简单测试：直接重定向到登录页
  console.log('🚫 Test middleware: Redirecting to login for testing')
  return NextResponse.redirect(new URL('/login', request.url))
}

export const config = {
  matcher: '/games/premium/:path*',
}
