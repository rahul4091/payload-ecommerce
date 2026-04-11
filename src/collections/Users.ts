import { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  // In Users.ts add access control
access: {
  read: ({ req }) => !!req.user,                        // must be logged in
  create: () => true,                                   // anyone can register
  update: ({ req, id }) => {
    if (req.user?.role === 'admin') return true         // admin can update anyone
    return req.user?.id === id                          // user can update themselves
  },
  delete: ({ req }) => req.user?.role === 'admin',      // admin only
},
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Customer', value: 'customer' },
      ],
      defaultValue: 'customer',
      required: true,
      access: {
        update: ({ req }) => req.user?.role === 'admin',
      },
    },
  ],
}
