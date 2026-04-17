import { CollectionConfig } from 'payload'

const Wishlists: CollectionConfig = {
  slug: 'wishlists',
  admin: { useAsTitle: 'id' },
  access: {
    read: ({ req }) => {
      if (!req.user) return false
      if (req.user.role === 'admin') return true
      return { 'customer.email': { equals: req.user.email } }
    },
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    { name: 'customer', type: 'relationship', relationTo: 'customers', required: true },
    { name: 'products', type: 'relationship', relationTo: 'products', hasMany: true },
  ],
}

export default Wishlists
