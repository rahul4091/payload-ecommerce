import { CollectionConfig } from 'payload'

const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'id',
  },
  access: {
  read: ({ req }) => {
    if (!req.user) return false
    if (req.user.role === 'admin') return true         // admin sees all orders
    return {                                           // customer sees only their orders
      'customer.email': {
        equals: req.user.email,
      },
    }
  },
  create: ({ req }) => !!req.user,
  update: ({ req }) => req.user?.role === 'admin',     // only admin can update orders
  delete: ({ req }) => req.user?.role === 'admin',     // only admin can delete
},
  hooks: {
  beforeChange: [
    async ({ data, req }) => {
      if (data.products && data.products.length > 0) {
        const productDocs = await Promise.all(
          data.products.map((product: any) => {
            // 👇 handle both string ID and object
            const id = typeof product === 'string' ? product : product.id
            return req.payload.findByID({
              collection: 'products',
              id,
            })
          })
        )

        const total = productDocs.reduce((sum: number, product: any) => {
          return sum + (product?.price || 0)
        }, 0)

        data.total = total
      }

      return data
    },
  ],

afterChange: [
      async ({ doc, operation, req }) => {
        // Only send email on new order creation
        if (operation === 'create') {
          try {
            // Get customer details
            const customer = await req.payload.findByID({
              collection: 'customers',
              id: typeof doc.customer === 'string' ? doc.customer : doc.customer.id,
            })

            // Get product details
            const productNames = doc.products?.map((p: any) =>
              typeof p === 'string' ? p : p.name
            ).join(', ')

            // Send email to customer
            await req.payload.sendEmail({
              to: customer.email,
              subject: `✅ Order Confirmed — ₹${doc.total}`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                  <h1 style="color: #000;">Order Confirmed! 🎉</h1>
                  <p>Hi ${customer.name},</p>
                  <p>Your order has been placed successfully.</p>

                  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h2 style="margin: 0 0 12px;">Order Details</h2>
                    <p><strong>Order ID:</strong> ${doc.id}</p>
                    <p><strong>Products:</strong> ${productNames}</p>
                    <p><strong>Total:</strong> ₹${doc.total}</p>
                    <p><strong>Status:</strong> ${doc.status}</p>
                  </div>

                  <p>We'll notify you when your order is shipped.</p>
                  <p>Thank you for shopping with us! 🛍️</p>
                </div>
              `,
            })
             // Send email to admin
            await req.payload.sendEmail({
              to: process.env.SMTP_USER || '',
              subject: `🛒 New Order — ₹${doc.total}`,
              html: `
                <div style="font-family: sans-serif;">
                  <h1>New Order Received!</h1>
                  <p><strong>Customer:</strong> ${customer.email}</p>
                  <p><strong>Products:</strong> ${productNames}</p>
                  <p><strong>Total:</strong> ₹${doc.total}</p>
                  <p><strong>Status:</strong> ${doc.status}</p>
                  <a href="http://localhost:3000/admin/collections/orders/${doc.id}"
                     style="background: #000; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none;">
                    View Order in Admin
                  </a>
                </div>
              `,
            })

            console.log(`📧 Order confirmation email sent to ${customer.email}`)
          } catch (err) {
            console.error('Failed to send order email:', err)
          }
        }
      },
    ],
  },
endpoints: [
  {
    path: '/summary',
    method: 'get',
    handler: async (req) => {
      // protect the endpoint
      if (!req.user) {
        return Response.json(
          { error: 'You must be logged in' },
          { status: 401 }
        )
      }

      const orders = await req.payload.find({
        collection: 'orders',
        limit: 100,
      })

      const summary = {
        totalOrders: orders.totalDocs,
        totalRevenue: orders.docs.reduce((sum, order) => sum + (order.total || 0), 0),
        byStatus: {
          pending: orders.docs.filter(o => o.status === 'pending').length,
          processing: orders.docs.filter(o => o.status === 'processing').length,
          shipped: orders.docs.filter(o => o.status === 'shipped').length,
          delivered: orders.docs.filter(o => o.status === 'delivered').length,
          cancelled: orders.docs.filter(o => o.status === 'cancelled').length,
        },
      }

      return Response.json(summary)
    },
  },
],
  fields: [
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
    },
    {
      name: 'products',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      defaultValue: 'pending',
      required: true,
    },
    {
      name: 'total',
      type: 'number',
      required: true,
    },
    {
      name: 'notes',
      type: 'textarea',
    },
  ],
}

export default Orders
