import { Webhooks } from '@dodopayments/nextjs'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export const POST = Webhooks({
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET!,
  onPaymentSucceeded: async (payload: any) => {
    const orderId = payload?.data?.metadata?.order_id
    const paymentId = payload?.data?.payment_id
    if (!orderId) return

    try {
      const db = await getPayload({ config: configPromise })
      await db.update({
        collection: 'orders',
        id: orderId,
        data: {
          status: 'processing',
          paymentId: paymentId || undefined,
        },
      })
      console.log(`Order ${orderId} updated to processing after payment ${paymentId}`)
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
