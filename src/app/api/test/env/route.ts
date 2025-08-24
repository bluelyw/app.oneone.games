import { NextResponse } from 'next/server'

export async function GET() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_APP_URL'
  ]

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

  if (missingVars.length > 0) {
    return NextResponse.json(
      { 
        error: '缺少环境变量',
        missing: missingVars 
      },
      { status: 400 }
    )
  }

  return NextResponse.json({
    message: '所有必需的环境变量已配置',
    envVars: requiredEnvVars.map(varName => ({
      name: varName,
      hasValue: !!process.env[varName],
      value: varName.includes('KEY') || varName.includes('SECRET') 
        ? `${process.env[varName]?.substring(0, 10)}...` 
        : process.env[varName]
    }))
  })
}
