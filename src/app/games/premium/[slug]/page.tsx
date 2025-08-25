'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'

interface GameInfo {
  title: string
  description: string
  externalUrl?: string
}

export default function PremiumGamePage() {
  const params = useParams()
  const slug = params.slug as string
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) {
          console.log('No user found')
        } else {
          setUser(user)
        }
      } catch (error) {
        console.error('Error checking user:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [])

  // 游戏信息映射
  const getGameInfo = (slug: string): GameInfo => {
    const games: { [key: string]: GameInfo } = {
      'fishygame': {
        title: 'Fishy Game',
        description: '一个有趣的钓鱼游戏，考验你的反应速度和策略思维。',
        externalUrl: 'https://fishygame.oneone.games/'
      },
      'default': {
        title: 'Premium Game',
        description: '这是一个会员专享的优质游戏。'
      }
    }

    return games[slug] || games.default
  }

  const gameInfo = getGameInfo(slug)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 会员专享标识 */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 rounded-full p-2 mr-4">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">会员专享</h1>
                <p className="text-purple-100">感谢您的订阅，享受专属游戏体验</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white text-sm">欢迎回来，{user?.email}</p>
            </div>
          </div>
        </div>

        {/* 游戏信息 */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{gameInfo.title}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{gameInfo.description}</p>
          </div>

          {/* 游戏内容区域 */}
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            {gameInfo.externalUrl ? (
              <div>
                <div className="mb-6">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">游戏已准备就绪</h3>
                  <p className="text-gray-600">点击下方按钮开始游戏</p>
                </div>
                <a
                  href={gameInfo.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                  开始游戏
                </a>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">游戏开发中</h3>
                  <p className="text-gray-600">这个游戏正在开发中，敬请期待</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <p className="text-yellow-800 text-sm">
                    这是一个示例页面，展示会员专享游戏的访问控制功能。
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 导航链接 */}
        <div className="flex justify-center space-x-4">
          <Link
            href="/account"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            我的账户
          </Link>
          <Link
            href="/billing"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
            </svg>
            会员管理
          </Link>
        </div>
      </div>
    </div>
  )
}
