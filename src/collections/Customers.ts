import { CollectionConfig } from 'payload'

const Customers: CollectionConfig = {
  slug: 'customers',
  auth: true,             // ✅ enables /api/customers/login + /api/customers/me
  admin: {
    useAsTitle: 'email',
  },
  access: {
    read: ({ req }) => !!req.user,
    create: () => true,   // ✅ allows public registration
    update: ({ req, id }) => {
      if (req.user?.role === 'admin') return true
      return req.user?.id === id
    },
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',      // ✅ was 'text'
      required: true,
      unique: true,
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'address',    // ✅ fixed typo (was 'addrss')
      type: 'textarea',
    },
  ],
}

export default Customers
