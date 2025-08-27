'use client'

import Link from 'next/link'
import { useEffect, useState, Suspense } from 'react'
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

function AccountPageContent() {
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

      // Fetch membership status and purchase records using server-side API
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
      setError('Failed to load user information')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadUserData()
  }, [router])

  useEffect(() => {
    // Check for payment success parameters
    if (searchParams.get('success')) {
      const sessionId = searchParams.get('session_id')
      
      // Show success message
      setShowSuccessMessage(true)
      setRefreshing(true)
      
      // If session_id exists, verify payment status first
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
            // Refresh data after successful verification
            setTimeout(() => {
              loadUserData()
              // Hide success message after data loads
              setTimeout(() => {
                setShowSuccessMessage(false)
              }, 2000)
            }, 1000)
          } else {
            console.error('Payment verification failed:', data.error)
            // Even if verification fails, try to refresh data
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
          // If verification errors, delay data refresh
          setTimeout(() => {
            loadUserData()
            setTimeout(() => {
              setShowSuccessMessage(false)
            }, 2000)
          }, 3000)
        })
      } else {
        // No session_id, use original logic
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
      active: 'Active',
      past_due: 'Past Due',
      canceled: 'Canceled',
      incomplete: 'Incomplete',
      incomplete_expired: 'Expired',
      trialing: 'Trial',
      unpaid: 'Unpaid'
    }
    return statusMap[status] || status
  }

  const getMembershipTypeText = (type: string) => {
    return type === 'subscription' ? 'Premium Membership' : 'One-time Purchase'
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100) // Stripe amounts are in cents
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg">
            <div className="px-6 py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading your account...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">
                  Payment successful! Membership status is being updated...
                  {refreshing && <span className="ml-2">🔄 Refreshing...</span>}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
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

        {/* Account Header */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="px-6 py-8">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">👤</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
                <p className="text-gray-600">Welcome back, {user.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center mb-3">
                  <svg className="w-5 h-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <h3 className="font-medium text-gray-900">Email Address</h3>
                </div>
                <p className="text-gray-600">{user.email}</p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center mb-3">
                  <svg className="w-5 h-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <h3 className="font-medium text-gray-900">Member Since</h3>
                </div>
                <p className="text-gray-600">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Membership Status */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="px-6 py-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Membership Status</h2>
            </div>
            
            {membership ? (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-2xl">👑</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {getMembershipTypeText(membership.type)}
                      </h3>
                      <p className="text-purple-600 font-medium">
                        Status: {getMembershipStatusText(membership.status)}
                      </p>
                      <p className="text-gray-600 text-sm mt-1">
                        Expires: {new Date(membership.current_period_end).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      Active Member
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Free User</h3>
                      <p className="text-gray-600">Upgrade to premium for exclusive games and features</p>
                    </div>
                  </div>
                  <Link 
                    href="/billing"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                  >
                    Upgrade Now
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Purchase History */}
        {purchases.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg mb-8">
            <div className="px-6 py-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Purchase History</h2>
              </div>
              
              <div className="space-y-4">
                {purchases.map((purchase) => (
                  <div key={purchase.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{purchase.product_name}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(purchase.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(purchase.amount, purchase.currency)}
                        </p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          purchase.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          purchase.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {purchase.status === 'completed' ? 'Completed' :
                           purchase.status === 'pending' ? 'Pending' : 'Failed'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg">
          <div className="px-6 py-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link 
                href="/billing"
                className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 hover:from-blue-100 hover:to-purple-100 transition-all duration-200"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Manage Membership</h3>
                  <p className="text-sm text-gray-600">View plans & billing</p>
                </div>
              </Link>
              
              <Link 
                href="/games/premium/demo"
                className="flex items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:from-green-100 hover:to-emerald-100 transition-all duration-200"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Play Games</h3>
                  <p className="text-sm text-gray-600">Access premium games</p>
                </div>
              </Link>
              
              <Link 
                href="/"
                className="flex items-center p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200 hover:from-gray-100 hover:to-slate-100 transition-all duration-200"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Back to Home</h3>
                  <p className="text-sm text-gray-600">Return to dashboard</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AccountPageContent />
    </Suspense>
  )
}
