'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Header() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      })
      
      if (response.ok) {
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              app.oneone.games
            </Link>
          </div>
          
          <nav className="flex items-center space-x-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
              登录
            </Link>
            <Link href="/signup" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
              注册
            </Link>
            <Link href="/account" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
              账户
            </Link>
            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {isLoading ? '退出中...' : '退出'}
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}
