import { CollectionConfig } from 'payload'

const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
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
          where: {
            or: [
              { name: { like: query } },
              { description: { like: query } },
            ],
          },
          depth: 1,
          limit: 20,
        })

        return Response.json({
          query,
          results: result.docs,
          total: result.totalDocs,
        })
      },
    },
  ],
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'price',
      type: 'number',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'inStock',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
    },
    {
      name: 'image',
      type: 'upload',       // ✅ was 'relationship' — now returns image.url correctly
      relationTo: 'media',
    },
    {
      name: 'dodopayments_product_id',
      type: 'text',
      admin: {
        description: 'Product ID from your DodoPayments dashboard (e.g. pdt_xxx). Required for checkout.',
        position: 'sidebar',
      },
    },
  ],
}

export default Products
