import Link from 'next/link'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          app.oneone.games
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">项目信息</h2>
          <p className="text-gray-600 mb-4">
            这是 OneOne Games 的应用平台，负责账号管理、支付处理和会员服务。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
            <div>
              <strong>技术栈：</strong> Next.js 15, TypeScript, Tailwind CSS
            </div>
            <div>
              <strong>部署：</strong> Vercel Pro
            </div>
            <div>
              <strong>后端：</strong> Supabase (Auth/DB/Storage)
            </div>
            <div>
              <strong>支付：</strong> Stripe (Checkout + Webhooks)
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/login" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">登录</h3>
            <p className="text-gray-600 text-sm">使用魔法链接登录账户</p>
          </Link>
          
          <Link href="/signup" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">注册</h3>
            <p className="text-gray-600 text-sm">创建新账户</p>
          </Link>
          
          <Link href="/account" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">账户</h3>
            <p className="text-gray-600 text-sm">查看账户信息和会员状态</p>
          </Link>
          
          <Link href="/billing" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">会员</h3>
            <p className="text-gray-600 text-sm">订阅会员和购买服务</p>
          </Link>
        </div>

        {/* 开发工具 */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">开发工具</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/test-payment" className="bg-blue-600 text-white rounded-lg p-4 hover:bg-blue-700 transition-colors">
              <h3 className="text-lg font-semibold mb-2">M2 支付测试</h3>
              <p className="text-blue-100 text-sm">验证 Stripe 支付系统集成</p>
            </Link>
            
            <Link href="/test-auth" className="bg-green-600 text-white rounded-lg p-4 hover:bg-green-700 transition-colors">
              <h3 className="text-lg font-semibold mb-2">认证测试</h3>
              <p className="text-green-100 text-sm">测试 Supabase Auth 功能</p>
            </Link>

            <Link href="/games/premium/demo" className="bg-purple-600 text-white rounded-lg p-4 hover:bg-purple-700 transition-colors">
              <h3 className="text-lg font-semibold mb-2">M3 中间件测试</h3>
              <p className="text-purple-100 text-sm">测试付费游戏访问控制</p>
            </Link>
          </div>
        </div>

        {/* 环境信息 */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">环境信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>NODE_ENV:</strong> {process.env.NODE_ENV}
            </div>
            <div>
              <strong>APP_URL:</strong> {process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
