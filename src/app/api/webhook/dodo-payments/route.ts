import { Webhooks } from '@dodopayments/nextjs'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

// Lazily initialize so missing env var doesn't crash at build time
function getHandler() {
  const secret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET
  if (!secret) return null

  return Webhooks({
    webhookKey: secret,
    onPaymentSucceeded: async (payload: any) => {
      const orderId = payload?.data?.metadata?.order_id
      const paymentId = payload?.data?.payment_id
      if (!orderId) return
      try {
        const db = await getPayload({ config: configPromise })
        await db.update({
          collection: 'orders',
          id: orderId,
          data: { status: 'processing', paymentId: paymentId || undefined },
        })
      } catch (err) {
        console.error('Webhook order update failed:', err)
      }
    },
    onPaymentFailed: async (payload: any) => {
      const orderId = payload?.data?.metadata?.order_id
      if (!orderId) return
      try {
        const db = await getPayload({ config: configPromise })
        await db.update({
          collection: 'orders',
          id: orderId,
          data: { status: 'cancelled' },
        })
      } catch (err) {
        console.error('Webhook payment failed handler error:', err)
      }
    },
  })
}

export async function POST(req: Request) {
  const handler = getHandler()
  if (!handler) {
    return Response.json({ error: 'Webhook secret not configured' }, { status: 503 })
  }
  return handler(req)
}
