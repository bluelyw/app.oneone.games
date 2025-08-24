'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient()

      try {
        // 检查URL中的各种参数
        const hash = window.location.hash
        const code = searchParams.get('code')
        const token = searchParams.get('token')
        const type = searchParams.get('type')
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')
        
        console.log('=== Auth Callback Debug Info ===')
        console.log('Full URL:', window.location.href)
        console.log('Hash:', hash)
        console.log('Code:', code)
        console.log('Token:', token)
        console.log('Type:', type)
        console.log('Error:', error)
        console.log('Error Description:', errorDescription)
        console.log('Search params:', Object.fromEntries(searchParams.entries()))
        console.log('===============================')
        
        // 如果有错误参数，直接跳转到错误页面
        if (error) {
          console.error('Auth error from URL:', error, errorDescription)
          router.push('/auth/auth-code-error')
          return
        }
        
        // 对于 Supabase 验证链接，直接获取 session
        // 因为 Supabase 已经验证了 token 并设置了 session
        console.log('Getting current session...')
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          router.push('/auth/auth-code-error')
          return
        }

        if (session) {
          console.log('Auth successful, session found:', session.user.email)
          // 获取 next 参数，默认为 /account
          const next = searchParams.get('next') || '/account'
          console.log('Redirecting to:', next)
          router.push(next)
        } else {
          console.log('No session found, trying to exchange code...')
          
          // 如果没有 session，尝试其他方法
          let result
          
          if (hash) {
            // 处理hash格式的魔法链接
            console.log('Processing hash format')
            result = await supabase.auth.getSession()
          } else if (code) {
            // 处理code格式的魔法链接
            console.log('Processing code format')
            result = await supabase.auth.exchangeCodeForSession(code)
          } else {
            // 尝试处理完整的URL
            console.log('Processing full URL')
            result = await supabase.auth.exchangeCodeForSession(window.location.href)
          }
          
          const { data, error: authError } = result
          
          if (authError) {
            console.error('Auth callback error:', authError)
            router.push('/auth/auth-code-error')
            return
          }
  
          if (data.session) {
            console.log('Auth successful, session created:', data.session.user.email)
            const next = searchParams.get('next') || '/account'
            console.log('Redirecting to:', next)
            router.push(next)
          } else {
            console.log('No session created')
            router.push('/login')
          }
        }
      } catch (error) {
        console.error('Unexpected error during auth callback:', error)
        router.push('/auth/auth-code-error')
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">处理登录中...</h2>
          <p className="mt-2 text-sm text-gray-600">请稍候，正在验证您的登录信息</p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
