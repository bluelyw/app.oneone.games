'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'

export default function TestAuthPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const testSignIn = async () => {
    if (!email) {
      setError('请输入邮箱地址')
      return
    }

    setMessage('')
    setError('')

    try {
      const supabase = createClient()
      
      // 使用不同的重定向URL进行测试
      const redirectTo = `${window.location.origin}/auth/callback?next=/test-auth`
      
      console.log('Testing sign in with redirectTo:', redirectTo)
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo
        }
      })

      if (error) {
        setError(`发送失败: ${error.message}`)
      } else {
        setMessage('测试魔法链接已发送，请检查邮箱')
      }
    } catch (err) {
      setError(`测试失败: ${err}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            认证配置测试
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            测试魔法链接配置
          </p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                测试邮箱地址
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="请输入测试邮箱地址"
                />
              </div>
            </div>

            {message && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                {message}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <button
                onClick={testSignIn}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                发送测试魔法链接
              </button>
            </div>
          </div>
        </div>

        <div className="text-center">
          <a href="/" className="text-sm text-gray-600 hover:text-gray-500">
            ← 返回首页
          </a>
        </div>
      </div>
    </div>
  )
}
