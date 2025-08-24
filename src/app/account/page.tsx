'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

interface Membership {
  id: string
  status: string
  type: string
  current_period_end: string
  created_at: string
}

interface Purchase {
  id: string
  amount: number
  currency: string
  status: string
  product_name: string
  created_at: string
}

export default function AccountPage() {
  const [user, setUser] = useState<any>(null)
  const [membership, setMembership] = useState<Membership | null>(null)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const loadUserData = async () => {
    const supabase = createClient()
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        console.log('No user found, redirecting to login')
        router.push('/login')
        return
      }

      console.log('User found:', user.email)
      setUser(user)

      // 使用服务器端 API 获取会员状态和购买记录
      const response = await fetch('/api/account/data')
      if (response.ok) {
        const data = await response.json()
        if (data.membership) {
          setMembership(data.membership)
        }
        if (data.purchases) {
          setPurchases(data.purchases)
        }
        if (data.errors.membership || data.errors.purchases) {
          console.error('API errors:', data.errors)
        }
      } else {
        console.error('Failed to fetch account data:', response.status)
      }

    } catch (error) {
      console.error('Error checking user:', error)
      setError('加载用户信息失败')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadUserData()
  }, [router])

  useEffect(() => {
    // 检查支付成功参数
    if (searchParams.get('success')) {
      const sessionId = searchParams.get('session_id')
      
      // 显示成功消息
      setShowSuccessMessage(true)
      setRefreshing(true)
      
      // 如果有 session_id，先验证支付状态
      if (sessionId) {
        console.log('Verifying payment for session:', sessionId)
        
        fetch('/api/checkout/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        })
        .then(response => response.json())
        .then(data => {
          console.log('Payment verification result:', data)
          if (data.success) {
            // 验证成功后刷新数据
            setTimeout(() => {
              loadUserData()
              // 数据加载完成后隐藏成功消息
              setTimeout(() => {
                setShowSuccessMessage(false)
              }, 2000)
            }, 1000)
          } else {
            console.error('Payment verification failed:', data.error)
            // 即使验证失败，也尝试刷新数据
            setTimeout(() => {
              loadUserData()
              setTimeout(() => {
                setShowSuccessMessage(false)
              }, 2000)
            }, 3000)
          }
        })
        .catch(error => {
          console.error('Error verifying payment:', error)
          // 验证出错时，延迟刷新数据
          setTimeout(() => {
            loadUserData()
            setTimeout(() => {
              setShowSuccessMessage(false)
            }, 2000)
          }, 3000)
        })
      } else {
        // 没有 session_id，使用原来的逻辑
        setTimeout(() => {
          loadUserData()
          setTimeout(() => {
            setShowSuccessMessage(false)
          }, 2000)
        }, 3000)
      }
    }
  }, [searchParams])

  const getMembershipStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      active: '活跃',
      past_due: '逾期',
      canceled: '已取消',
      incomplete: '未完成',
      incomplete_expired: '未完成已过期',
      trialing: '试用中',
      unpaid: '未支付'
    }
    return statusMap[status] || status
  }

  const getMembershipTypeText = (type: string) => {
    return type === 'subscription' ? '订阅会员' : '一次性购买'
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100) // Stripe 金额以分为单位
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">加载中...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 成功提示 */}
        {showSuccessMessage && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">
                  支付成功！会员状态正在更新中...
                  {refreshing && <span className="ml-2">🔄 正在刷新...</span>}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              账户信息
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">邮箱</label>
                <p className="mt-1 text-sm text-gray-900">{user.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">用户ID</label>
                <p className="mt-1 text-sm text-gray-900">{user.id}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">注册时间</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(user.created_at).toLocaleString('zh-CN')}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">最后登录</label>
                <p className="mt-1 text-sm text-gray-900">
                  {user.last_sign_in_at 
                    ? new Date(user.last_sign_in_at).toLocaleString('zh-CN')
                    : '首次登录'
                  }
                </p>
              </div>
            </div>

            {/* 会员状态 */}
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">会员状态</h4>
              {membership ? (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        {getMembershipTypeText(membership.type)} - {getMembershipStatusText(membership.status)}
                      </p>
                      <p className="text-sm text-green-700">
                        到期时间：{new Date(membership.current_period_end).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">免费用户</p>
                      <p className="text-sm text-gray-600">升级到会员享受更多功能</p>
                    </div>
                    <Link 
                      href="/billing"
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      升级会员
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 购买记录 */}
            {purchases.length > 0 && (
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">购买记录</h4>
                <div className="space-y-3">
                  {purchases.map((purchase) => (
                    <div key={purchase.id} className="bg-gray-50 rounded-md p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{purchase.product_name}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(purchase.created_at).toLocaleString('zh-CN')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(purchase.amount, purchase.currency)}
                          </p>
                          <p className={`text-xs ${
                            purchase.status === 'completed' ? 'text-green-600' : 
                            purchase.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {purchase.status === 'completed' ? '已完成' :
                             purchase.status === 'pending' ? '处理中' : '失败'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 border-t border-gray-200 pt-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">账户活动</h4>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span>登录成功</span>
                  <span className="ml-auto text-gray-400">
                    {new Date().toLocaleString('zh-CN')}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span>账户创建</span>
                  <span className="ml-auto text-gray-400">
                    {new Date(user.created_at).toLocaleString('zh-CN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
