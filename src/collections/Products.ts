import { CollectionConfig } from 'payload'

const Products: CollectionConfig = {
  slug: 'products',
  admin: { useAsTitle: 'name' },
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-update inStock based on stock count when stock is provided
        if (typeof data.stock === 'number') {
          data.inStock = data.stock > 0
        }
        return data
      },
    ],
  },
  endpoints: [
    {
      path: '/search',
      method: 'get',
      handler: async (req) => {
        const query = req.searchParams?.get('q') || ''
        if (!query) {
          return Response.json({ error: 'Please provide a search query ?q=' }, { status: 400 })
        }
        const result = await req.payload.find({
          collection: 'products',
          where: { or: [{ name: { like: query } }, { description: { like: query } }] },
          depth: 1,
          limit: 20,
        })
        return Response.json({ query, results: result.docs, total: result.totalDocs })
      },
    },
  ],
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'price', type: 'number', required: true },
    { name: 'description', type: 'textarea' },
    {
      name: 'stock',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Units in stock. Automatically marks product out of stock when 0.',
        position: 'sidebar',
      },
    },
    { name: 'inStock', type: 'checkbox', defaultValue: true },
    { name: 'category', type: 'relationship', relationTo: 'categories' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'variants',
      type: 'array',
      admin: { description: 'Optional variants (sizes, colors, etc.). If set, customers must choose one.' },
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'sku', type: 'text' },
        { name: 'price', type: 'number', admin: { description: 'Leave empty to use product price' } },
        { name: 'stock', type: 'number', defaultValue: 0 },
      ],
    },
    {
      name: 'dodopayments_product_id',
      type: 'text',
      admin: {
        description: 'Product ID from DodoPayments dashboard (e.g. pdt_xxx). Required for checkout.',
        position: 'sidebar',
      },
    },
  ],
}

export default Products
