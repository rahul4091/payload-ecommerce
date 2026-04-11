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
      path: '/featured',
      method: 'get',
      handler: async (req) => {
        const result = await req.payload.find({
          collection: 'products',
          where: {
            inStock: {
              equals: true,
            },
          },
          limit: 5,
          sort: '-createdAt', // newest first
        })

        return Response.json({
          message: 'Featured products',
          products: result.docs,
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
