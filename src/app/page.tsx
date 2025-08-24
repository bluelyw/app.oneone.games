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
          <Link href="/login" className="block">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold mb-2 text-blue-600">登录</h3>
              <p className="text-gray-600 text-sm">用户登录页面</p>
            </div>
          </Link>
          
          <Link href="/signup" className="block">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold mb-2 text-green-600">注册</h3>
              <p className="text-gray-600 text-sm">用户注册页面</p>
            </div>
          </Link>
          
          <Link href="/account" className="block">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold mb-2 text-purple-600">账户</h3>
              <p className="text-gray-600 text-sm">账户信息管理</p>
            </div>
          </Link>
          
          <Link href="/billing" className="block">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold mb-2 text-orange-600">支付</h3>
              <p className="text-gray-600 text-sm">会员订阅管理</p>
            </div>
          </Link>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>当前环境: {process.env.NEXT_PUBLIC_APP_URL || '开发环境'}</p>
        </div>
      </div>
    </div>
  )
}
