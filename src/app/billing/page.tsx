'use client'

import Link from 'next/link'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

function BillingPageContent() {
  const [user, setUser] = useState<any>(null)
  const [membership, setMembership] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const checkUser = async () => {
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

        // 获取会员状态
        const response = await fetch('/api/account/data')
        if (response.ok) {
          const data = await response.json()
          if (data.membership) {
            setMembership(data.membership)
          }
        }
      } catch (error) {
        console.error('Error checking user:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

  useEffect(() => {
    // 检查 URL 参数
    if (searchParams.get('canceled')) {
      setError('支付已取消')
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

  const handleCancelSubscription = async () => {
    if (!membership) {
      setError('没有活跃的订阅')
      return
    }

    if (!confirm('确定要取消订阅吗？取消后仍可使用到当前计费周期结束。')) {
      return
    }

    setProcessing(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '取消订阅失败')
      }

      setSuccess(data.message)
      
      // 刷新会员状态
      const accountResponse = await fetch('/api/account/data')
      if (accountResponse.ok) {
        const accountData = await accountResponse.json()
        if (accountData.membership) {
          setMembership(accountData.membership)
        }
      }

    } catch (error) {
      console.error('Cancel subscription error:', error)
      setError(error instanceof Error ? error.message : '取消订阅失败')
    } finally {
      setProcessing(false)
    }
  }

  const handleSubscribe = async (priceId: string, type: 'subscription' | 'one_time') => {
    if (!user) {
      setError('请先登录')
      return
    }

    setProcessing(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          type,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '创建支付会话失败')
      }



      if (data.url) {
        // 重定向到 Stripe Checkout
        window.location.href = data.url
      } else {
        throw new Error('未收到支付链接')
      }

    } catch (error) {
      console.error('Payment error:', error)
      setError(error instanceof Error ? error.message : '支付处理失败')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">加载中...</p>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">会员订阅</h1>
          <p className="mt-2 text-gray-600">选择适合您的会员计划</p>
        </div>

        {/* 错误和成功提示 */}
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

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* 当前状态 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">当前状态</h2>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">会员类型</p>
              <p className="text-lg font-medium text-gray-900">
                {membership?.status === 'canceled' 
                  ? '免费用户' 
                  : membership 
                    ? `${getMembershipTypeText(membership.type)} - ${getMembershipStatusText(membership.status)}` 
                    : '免费用户'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">到期时间</p>
              <p className="text-lg font-medium text-gray-900">
                {membership?.status === 'active' && membership?.current_period_end 
                  ? new Date(membership.current_period_end).toLocaleString('zh-CN') 
                  : membership?.status === 'canceled' 
                    ? '已取消' 
                    : '-'}
              </p>
            </div>
          </div>
          
          {/* 取消订阅按钮 */}
          {membership && membership.status === 'active' && (
            <div className="border-t border-gray-200 pt-4">
              <button
                onClick={handleCancelSubscription}
                disabled={processing}
                className="w-full py-2 px-4 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? '处理中...' : '取消订阅'}
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                取消后立即结束订阅，可以重新订阅
              </p>
            </div>
          )}
        </div>

        {/* 会员计划 */}
        <div className="mb-8">
          {/* 专业版订阅 */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-500 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                推荐
              </span>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">专业版订阅</h3>
              <div className="text-3xl font-bold text-gray-900 mb-4">
                $1.99<span className="text-lg font-normal text-gray-600">/月</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-2 mb-6">
                <li>✓ 所有基础功能</li>
                <li>✓ 高级游戏访问</li>
                <li>✓ 优先客服支持</li>
                <li>✓ 无广告体验</li>
                <li>✓ 专属内容</li>
              </ul>
              {membership && membership.status === 'active' ? (
                <div className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-500 bg-gray-100 cursor-not-allowed">
                  已有活跃订阅
                </div>
              ) : (
                <button 
                  onClick={() => handleSubscribe('price_1RzV5e2LpjuxOcVX2VtbPCr7', 'subscription')}
                  disabled={processing}
                  className="w-full py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? '处理中...' : '选择专业版'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 支付说明 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">支付说明</h2>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• 支持信用卡/借记卡支付</p>
            <p>• 订阅将按月自动续费，除非您取消</p>
            <p>• 您可以随时取消订阅，取消后立即结束订阅</p>
            <p>• 取消后可以重新订阅，重新开始计算订阅周期</p>
            <p>• 所有价格均包含适用税费</p>
            <p>• 退款政策：7天内无条件退款</p>
            <p>• 支付完成后，会员状态将在60秒内更新</p>
            <p>• 如有疑问，请咨询：<a href="mailto:oneone.games111@gmail.com" className="text-blue-600 hover:text-blue-800 underline">oneone.games111@gmail.com</a></p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-500">
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BillingPageContent />
    </Suspense>
  )
}
