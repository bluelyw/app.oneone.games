import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  console.log('🔍 Test middleware triggered for:', request.nextUrl.pathname)
  
  // 测试所有路由
  if (request.nextUrl.pathname.startsWith('/games/premium/')) {
    console.log('🎮 Test middleware: Processing premium game route')
    console.log('🚫 Test middleware: Redirecting to login for testing')
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  console.log('⏭️ Test middleware: Not a premium game route, skipping')
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/games/premium/:path*',
  ],
}
