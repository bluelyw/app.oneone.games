import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export async function GET() {
  try {
    // 测试 Stripe API 连接
    const account = await stripe.accounts.retrieve()

    return NextResponse.json({
      message: 'Stripe API 连接正常',
      accountId: account.id,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled
    })

  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { 
          error: 'Stripe API 连接失败',
          details: error.message,
          type: error.type
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Stripe 连接异常',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}
