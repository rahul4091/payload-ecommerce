import { NextRequest } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function POST(req: NextRequest) {
  const { code, subtotal } = await req.json()
  if (!code?.trim()) return Response.json({ error: 'No code provided' }, { status: 400 })

  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'discounts',
    where: {
      and: [
        { code: { equals: code.toUpperCase().trim() } },
        { active: { equals: true } },
      ],
    },
    limit: 1,
  })

  const discount = result.docs[0] as any
  if (!discount) return Response.json({ error: 'Invalid discount code' }, { status: 404 })

  if (discount.expiresAt && new Date(discount.expiresAt) < new Date()) {
    return Response.json({ error: 'This discount code has expired' }, { status: 400 })
  }

  if (discount.maxUses && discount.usedCount >= discount.maxUses) {
    return Response.json({ error: 'This discount code has reached its usage limit' }, { status: 400 })
  }

  if (discount.minOrder && subtotal < discount.minOrder) {
    return Response.json({ error: `Minimum order ₹${discount.minOrder} required` }, { status: 400 })
  }

  const discountAmount = discount.type === 'percentage'
    ? Math.round(subtotal * (discount.value / 100))
    : Math.min(discount.value, subtotal)

  return Response.json({
    id: discount.id,
    code: discount.code,
    discountAmount,
    description: discount.type === 'percentage' ? `${discount.value}% off` : `₹${discount.value} off`,
  })
}
