import { NextRequest } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import DodoPayments from 'dodopayments'

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('JWT ')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.slice(4)

    // Verify customer by calling Payload's /api/customers/me
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
    const meRes = await fetch(`${baseUrl}/api/customers/me`, {
      headers: { Authorization: `JWT ${token}` },
    })
    const meData = await meRes.json()
    if (!meData?.user?.id) {
      return Response.json({ error: 'Invalid token' }, { status: 401 })
    }
    const customer = meData.user

    const { cartItems, shippingAddress, notes } = await req.json()

    if (!cartItems?.length) {
      return Response.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })

    // Fetch full product details to get dodopayments_product_id and calculate total
    const productDocs = await Promise.all(
      cartItems.map((item: any) =>
        payload.findByID({ collection: 'products', id: item.id })
      )
    )

    // Validate all products have DodoPayments IDs
    const missingDodo = productDocs.filter((p: any) => !p?.dodopayments_product_id)
    if (missingDodo.length > 0) {
      const names = missingDodo.map((p: any) => p.name).join(', ')
      return Response.json(
        { error: `These products are not configured for payment: ${names}. Add a DodoPayments product ID in the admin panel.` },
        { status: 400 }
      )
    }

    const total = cartItems.reduce(
      (sum: number, item: any) => sum + item.price * (item.quantity || 1),
      0
    )

    // Create the order in Payload first (status: pending_payment)
    const order = await payload.create({
      collection: 'orders',
      data: {
        customer: customer.id,
        products: cartItems.map((item: any) => item.id),
        total,
        status: 'pending_payment',
        notes: notes || '',
        shippingAddress,
      },
    })

    // Build DodoPayments product cart
    const productCart = cartItems.map((item: any) => {
      const doc = productDocs.find((p: any) => p.id === item.id) as any
      return {
        product_id: doc.dodopayments_product_id as string,
        quantity: item.quantity || 1,
      }
    })

    const apiKey = process.env.DODO_PAYMENTS_API_KEY
    if (!apiKey) {
      // Fallback: if no Dodo API key, just mark order as pending and redirect to success
      await payload.update({
        collection: 'orders',
        id: order.id,
        data: { status: 'pending' },
      })
      return Response.json({
        checkout_url: `${baseUrl}/order-success?orderId=${order.id}`,
        orderId: order.id,
      })
    }

    const dodo = new DodoPayments({ bearerToken: apiKey, environment: (process.env.DODO_PAYMENTS_ENVIRONMENT as any) || 'test_mode' })

    const session = await dodo.checkoutSessions.create({
      product_cart: productCart,
      customer: { email: customer.email, name: customer.name },
      billing_address: {
        country: (shippingAddress.country || 'IN') as any,
        city: shippingAddress.city,
        state: shippingAddress.state,
        street: shippingAddress.street,
        zipcode: shippingAddress.zipcode,
      },
      return_url: `${baseUrl}/order-success?orderId=${order.id}`,
      cancel_url: `${baseUrl}/checkout`,
      metadata: { order_id: order.id },
    })

    // Store the checkout session ID on the order
    await payload.update({
      collection: 'orders',
      id: order.id,
      data: { paymentId: session.session_id },
    })

    return Response.json({ checkout_url: session.checkout_url, orderId: order.id })
  } catch (err: any) {
    console.error('create-checkout error:', err)
    return Response.json({ error: err?.message || 'Checkout failed' }, { status: 500 })
  }
}
