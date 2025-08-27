import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export async function GET() {
  try {
    // 获取所有价格
    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product']
    })

    // 过滤出我们需要的价格
    const relevantPrices = prices.data.filter(price => {
      const product = price.product as Stripe.Product
      return product && (
        product.id === 'prod_SvLnLyJhWgjFuS' || 
        product.id === 'prod_SvLnRsC6q7uf1W'
      )
    })

    return NextResponse.json({
      prices: relevantPrices.map(price => ({
        id: price.id,
        product_id: (price.product as Stripe.Product).id,
        product_name: (price.product as Stripe.Product).name,
        unit_amount: price.unit_amount,
        currency: price.currency,
        recurring: price.recurring,
        type: price.type
      }))
    })

  } catch (error) {
    console.error('Error fetching prices:', error)
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Stripe 错误: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '获取价格列表失败' },
      { status: 500 }
    )
  }
}
