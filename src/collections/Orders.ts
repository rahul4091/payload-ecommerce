import { CollectionConfig } from 'payload'

const STATUS_EMAILS: Record<string, { subject: string; message: string }> = {
  processing: {
    subject: '🔄 Your order is being processed',
    message: 'Great news! Your order is now being processed and will be shipped soon.',
  },
  shipped: {
    subject: '🚚 Your order has been shipped!',
    message: 'Your order is on its way! You should receive it within 3–7 business days.',
  },
  delivered: {
    subject: '✅ Your order has been delivered!',
    message: 'Your order has been successfully delivered. We hope you love it!',
  },
  cancelled: {
    subject: '❌ Your order has been cancelled',
    message: 'Your order has been cancelled. If you have questions, please contact us.',
  },
}

const Orders: CollectionConfig = {
  slug: 'orders',
  admin: { useAsTitle: 'id' },
  access: {
    read: ({ req }) => {
      if (!req.user) return false
      if (req.user.role === 'admin') return true
      return { 'customer.email': { equals: req.user.email } }
    },
    create: ({ req }) => !!req.user,
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        if (data.items?.length > 0) {
          const subtotal = data.items.reduce(
            (sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 1),
            0,
          )
          data.total = Math.max(0, subtotal - (Number(data.discountAmount) || 0) + (Number(data.shippingAmount) || 0))
        } else if (data.products?.length > 0) {
          const docs = await Promise.all(
            data.products.map((p: any) =>
              req.payload.findByID({ collection: 'products', id: typeof p === 'string' ? p : p.id }),
            ),
          )
          data.total = docs.reduce((sum: number, p: any) => sum + (p?.price || 0), 0)
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        try {
          const customer = await req.payload.findByID({
            collection: 'customers',
            id: typeof doc.customer === 'string' ? doc.customer : doc.customer?.id,
          })
          if (!customer?.email) return

          const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

          if (operation === 'create') {
            // Decrement stock for each ordered item
            for (const item of doc.items || []) {
              const productId = typeof item.product === 'string' ? item.product : item.product?.id
              if (!productId) continue
              try {
                const product = await req.payload.findByID({ collection: 'products', id: productId })
                if (typeof product.stock === 'number') {
                  const newStock = Math.max(0, product.stock - (item.quantity || 1))
                  await req.payload.update({
                    collection: 'products',
                    id: productId,
                    data: { stock: newStock, inStock: newStock > 0 },
                  })
                }
              } catch (e) {
                console.error('Stock decrement failed:', productId, e)
              }
            }

            // Increment usedCount on discount
            if (doc.discountCode) {
              try {
                const discountResult = await req.payload.find({
                  collection: 'discounts',
                  where: { code: { equals: doc.discountCode } },
                  limit: 1,
                })
                if (discountResult.docs[0]) {
                  await req.payload.update({
                    collection: 'discounts',
                    id: discountResult.docs[0].id,
                    data: { usedCount: (discountResult.docs[0].usedCount || 0) + 1 },
                  })
                }
              } catch (e) {
                console.error('Discount usedCount update failed:', e)
              }
            }

            const itemNames = doc.items?.length > 0
              ? doc.items.map((i: any) => `${typeof i.product === 'object' ? i.product?.name : 'Product'} ×${i.quantity || 1}`).join(', ')
              : doc.products?.map((p: any) => (typeof p === 'string' ? p : p.name)).join(', ') || ''

            await req.payload.sendEmail({
              to: customer.email,
              subject: `✅ Order Confirmed — ₹${doc.total}`,
              html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
                <h1>Order Confirmed! 🎉</h1>
                <p>Hi ${customer.name},</p>
                <p>Your order has been placed successfully.</p>
                <div style="background:#f9f9f9;padding:20px;border-radius:8px;margin:20px 0">
                  <p><strong>Order ID:</strong> ${doc.id}</p>
                  <p><strong>Items:</strong> ${itemNames}</p>
                  <p><strong>Total:</strong> ₹${doc.total}</p>
                  <p><strong>Status:</strong> ${doc.status}</p>
                </div>
                <p>We'll notify you when your order ships. Thank you! 🛍️</p>
              </div>`,
            })

            await req.payload.sendEmail({
              to: process.env.SMTP_USER || '',
              subject: `🛒 New Order — ₹${doc.total}`,
              html: `<div style="font-family:sans-serif">
                <h1>New Order Received!</h1>
                <p><strong>Customer:</strong> ${customer.email}</p>
                <p><strong>Items:</strong> ${itemNames}</p>
                <p><strong>Total:</strong> ₹${doc.total}</p>
                <a href="${baseUrl}/admin/collections/orders/${doc.id}" style="background:#000;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none">View in Admin</a>
              </div>`,
            })
          }

          if (operation === 'update' && previousDoc?.status && previousDoc.status !== doc.status) {
            const emailData = STATUS_EMAILS[doc.status]
            if (emailData) {
              await req.payload.sendEmail({
                to: customer.email,
                subject: emailData.subject,
                html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
                  <h1>${emailData.subject}</h1>
                  <p>Hi ${customer.name},</p>
                  <p>${emailData.message}</p>
                  <div style="background:#f9f9f9;padding:20px;border-radius:8px;margin:20px 0">
                    <p><strong>Order ID:</strong> ${doc.id}</p>
                    <p><strong>Total:</strong> ₹${doc.total}</p>
                    <p><strong>Status:</strong> ${doc.status}</p>
                  </div>
                  <a href="${baseUrl}/orders" style="background:#000;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none">View My Orders</a>
                </div>`,
              })
            }
          }
        } catch (err) {
          console.error('Order afterChange hook error:', err)
        }
      },
    ],
  },
  endpoints: [
    {
      path: '/summary',
      method: 'get',
      handler: async (req) => {
        if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
        const orders = await req.payload.find({ collection: 'orders', limit: 1000 })
        return Response.json({
          totalOrders: orders.totalDocs,
          totalRevenue: orders.docs.reduce((s, o) => s + (o.total || 0), 0),
          byStatus: {
            pending_payment: orders.docs.filter(o => o.status === 'pending_payment').length,
            pending: orders.docs.filter(o => o.status === 'pending').length,
            processing: orders.docs.filter(o => o.status === 'processing').length,
            shipped: orders.docs.filter(o => o.status === 'shipped').length,
            delivered: orders.docs.filter(o => o.status === 'delivered').length,
            cancelled: orders.docs.filter(o => o.status === 'cancelled').length,
          },
        })
      },
    },
  ],
  fields: [
    { name: 'customer', type: 'relationship', relationTo: 'customers', required: true },
    { name: 'products', type: 'relationship', relationTo: 'products', hasMany: true },
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'product', type: 'relationship', relationTo: 'products' },
        { name: 'quantity', type: 'number', defaultValue: 1 },
        { name: 'price', type: 'number' },
        { name: 'variant', type: 'text' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      options: ['pending_payment', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      defaultValue: 'pending_payment',
      required: true,
    },
    { name: 'total', type: 'number', required: true },
    { name: 'discountCode', type: 'text', admin: { position: 'sidebar' } },
    { name: 'discountAmount', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
    { name: 'shippingAmount', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
    { name: 'paymentId', type: 'text', admin: { position: 'sidebar' } },
    {
      name: 'shippingAddress',
      type: 'group',
      fields: [
        { name: 'fullName', type: 'text' },
        { name: 'street', type: 'text' },
        { name: 'city', type: 'text' },
        { name: 'state', type: 'text' },
        { name: 'zipcode', type: 'text' },
        { name: 'country', type: 'text' },
        { name: 'phone', type: 'text' },
      ],
    },
    { name: 'notes', type: 'textarea' },
  ],
}

export default Orders
