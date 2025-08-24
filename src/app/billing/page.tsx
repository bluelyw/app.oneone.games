import Link from 'next/link'

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">会员订阅</h1>
          <p className="mt-2 text-gray-600">选择适合您的会员计划</p>
        </div>

        {/* 当前状态 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">当前状态</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">会员类型</p>
              <p className="text-lg font-medium text-gray-900">免费用户</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">到期时间</p>
              <p className="text-lg font-medium text-gray-900">-</p>
            </div>
          </div>
        </div>

        {/* 会员计划 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* 基础版 */}
          <div className="bg-white rounded-lg shadow p-6 border-2 border-gray-200">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">基础版</h3>
              <div className="text-3xl font-bold text-gray-900 mb-4">
                ¥0<span className="text-lg font-normal text-gray-600">/月</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-2 mb-6">
                <li>✓ 基础游戏访问</li>
                <li>✓ 标准客服支持</li>
                <li>✓ 基础功能</li>
                <li className="text-gray-400">✗ 高级游戏</li>
                <li className="text-gray-400">✗ 优先客服</li>
              </ul>
              <button className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                当前计划
              </button>
            </div>
          </div>

          {/* 专业版 */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-500 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                推荐
              </span>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">专业版</h3>
              <div className="text-3xl font-bold text-gray-900 mb-4">
                ¥29<span className="text-lg font-normal text-gray-600">/月</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-2 mb-6">
                <li>✓ 所有基础功能</li>
                <li>✓ 高级游戏访问</li>
                <li>✓ 优先客服支持</li>
                <li>✓ 无广告体验</li>
                <li>✓ 专属内容</li>
              </ul>
              <button className="w-full py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                选择专业版
              </button>
            </div>
          </div>

          {/* 企业版 */}
          <div className="bg-white rounded-lg shadow p-6 border-2 border-gray-200">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">企业版</h3>
              <div className="text-3xl font-bold text-gray-900 mb-4">
                ¥99<span className="text-lg font-normal text-gray-600">/月</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-2 mb-6">
                <li>✓ 所有专业功能</li>
                <li>✓ 企业级支持</li>
                <li>✓ 定制化服务</li>
                <li>✓ 团队管理</li>
                <li>✓ API 访问</li>
              </ul>
              <button className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                联系销售
              </button>
            </div>
          </div>
        </div>

        {/* 支付方式 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">支付方式</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="credit-card"
                name="payment-method"
                type="radio"
                defaultChecked
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="credit-card" className="ml-3 block text-sm font-medium text-gray-700">
                信用卡/借记卡
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="alipay"
                name="payment-method"
                type="radio"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="alipay" className="ml-3 block text-sm font-medium text-gray-700">
                支付宝
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="wechat"
                name="payment-method"
                type="radio"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="wechat" className="ml-3 block text-sm font-medium text-gray-700">
                微信支付
              </label>
            </div>
          </div>
        </div>

        {/* 订阅条款 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">订阅条款</h2>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• 订阅将按月自动续费，除非您取消</p>
            <p>• 您可以随时取消订阅，取消后仍可使用到当前计费周期结束</p>
            <p>• 所有价格均包含适用税费</p>
            <p>• 退款政策：7天内无条件退款</p>
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
