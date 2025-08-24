'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function TestPaymentPage() {
  const [testResults, setTestResults] = useState<any[]>([])

  const addTestResult = (test: string, status: 'pass' | 'fail', message: string) => {
    setTestResults(prev => [...prev, {
      test,
      status,
      message,
      timestamp: new Date().toLocaleString('zh-CN')
    }])
  }

  const runTests = async () => {
    setTestResults([])
    
    // 测试 1: 检查环境变量
    try {
      const response = await fetch('/api/test/env')
      if (response.ok) {
        addTestResult('环境变量检查', 'pass', '所有必需的环境变量已配置')
      } else {
        addTestResult('环境变量检查', 'fail', '缺少必需的环境变量')
      }
    } catch (error) {
      addTestResult('环境变量检查', 'fail', `检查失败: ${error}`)
    }

    // 测试 2: 检查数据库连接
    try {
      const response = await fetch('/api/test/db')
      if (response.ok) {
        addTestResult('数据库连接', 'pass', '数据库连接正常')
      } else {
        addTestResult('数据库连接', 'fail', '数据库连接失败')
      }
    } catch (error) {
      addTestResult('数据库连接', 'fail', `连接失败: ${error}`)
    }

    // 测试 3: 检查 Stripe 连接
    try {
      const response = await fetch('/api/test/stripe')
      if (response.ok) {
        addTestResult('Stripe 连接', 'pass', 'Stripe API 连接正常')
      } else {
        addTestResult('Stripe 连接', 'fail', 'Stripe API 连接失败')
      }
    } catch (error) {
      addTestResult('Stripe 连接', 'fail', `连接失败: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">M2 支付功能测试</h1>
          <p className="mt-2 text-gray-600">验证 Stripe 支付系统集成</p>
        </div>

        {/* 测试控制 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">自动化测试</h2>
          <button
            onClick={runTests}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            运行测试
          </button>
        </div>

        {/* 测试结果 */}
        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">测试结果</h2>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className={`p-3 rounded-md ${
                  result.status === 'pass' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      result.status === 'pass' ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        result.status === 'pass' ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {result.test}
                      </p>
                      <p className={`text-sm ${
                        result.status === 'pass' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {result.message}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {result.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 手动测试指南 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">手动测试指南</h2>
          
          <div className="space-y-6">
            {/* 测试 1 */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-2">1. 支付流程测试</h3>
              <div className="bg-gray-50 rounded-md p-4">
                <p className="text-sm text-gray-700 mb-2">步骤：</p>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                  <li>登录账户（使用魔法链接）</li>
                  <li>访问 <Link href="/billing" className="text-blue-600 hover:underline">/billing</Link> 页面</li>
                  <li>点击"选择专业版"或"立即购买"按钮</li>
                  <li>使用 Stripe 测试卡完成支付</li>
                  <li>验证支付成功后跳转到 /account 页面</li>
                  <li>检查会员状态是否在 60 秒内更新</li>
                </ol>
              </div>
            </div>

            {/* 测试 2 */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-2">2. Stripe 测试卡</h3>
              <div className="bg-gray-50 rounded-md p-4">
                <p className="text-sm text-gray-700 mb-2">推荐测试卡：</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li><strong>成功支付：</strong> 4242 4242 4242 4242</li>
                  <li><strong>需要验证：</strong> 4000 0025 0000 3155</li>
                  <li><strong>支付失败：</strong> 4000 0000 0000 0002</li>
                  <li><strong>余额不足：</strong> 4000 0000 0000 9995</li>
                </ul>
                <p className="text-sm text-gray-500 mt-2">
                  有效期：任意未来日期 | CVC：任意 3 位数字 | 邮编：任意 5 位数字
                </p>
              </div>
            </div>

            {/* 测试 3 */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-2">3. Webhook 幂等性测试</h3>
              <div className="bg-gray-50 rounded-md p-4">
                <p className="text-sm text-gray-700 mb-2">验证步骤：</p>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                  <li>完成一次支付</li>
                  <li>在 Stripe Dashboard 中手动重发 webhook 事件</li>
                  <li>检查数据库中是否没有重复记录</li>
                  <li>验证会员状态没有异常变化</li>
                </ol>
              </div>
            </div>

            {/* 测试 4 */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-2">4. 错误处理测试</h3>
              <div className="bg-gray-50 rounded-md p-4">
                <p className="text-sm text-gray-700 mb-2">测试场景：</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 未登录用户访问 /billing 页面</li>
                  <li>• 使用无效的支付卡</li>
                  <li>• 网络中断时的错误提示</li>
                  <li>• 支付取消后的页面状态</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 验收标准 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">M2 验收标准</h2>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">✅ 支付流程</p>
                <p className="text-sm text-gray-600">使用 Stripe 测试卡能完成支付并 60s 内 /account 显示已开通</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">✅ Webhook 幂等性</p>
                <p className="text-sm text-gray-600">同一事件多次发送不重复插入数据库</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">✅ 错误处理</p>
                <p className="text-sm text-gray-600">出错时有可读的错误提示，不静默失败</p>
              </div>
            </div>
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
