import { CollectionConfig } from "payload";

const Customers: CollectionConfig = {
    slug: 'customers',
    admin: {
        useAsTitle: 'email',
    },
    access: {
  read: ({ req }) => !!req.user,
  create: ({ req }) => !!req.user,
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
            type: 'text',
            required: true,
            unique: true,
        },
        {
            name: 'phone',
            type: 'text',
        },
        {
            name: 'addrss',
            type: 'textarea',
        },
    ],
}

export default Customers;
