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
          { name: { like: query } },           // search by name
          { description: { like: query } },     // search by description
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
      name: 'category',           // 👈 new field
      type: 'relationship',
      relationTo: 'categories',
    },
    {
      name: 'image',              // 👈 new field
      type: 'relationship',
      relationTo: 'media',
    },
  ],
}

export default Products
