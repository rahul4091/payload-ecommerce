import { CollectionConfig } from 'payload'

const Discounts: CollectionConfig = {
  slug: 'discounts',
  admin: { useAsTitle: 'code' },
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'code', type: 'text', required: true, unique: true },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Percentage (%)', value: 'percentage' },
        { label: 'Fixed Amount (₹)', value: 'fixed' },
      ],
      required: true,
      defaultValue: 'percentage',
    },
    { name: 'value', type: 'number', required: true, admin: { description: '10 = 10% off or ₹10 off' } },
    { name: 'minOrder', type: 'number', defaultValue: 0, admin: { description: 'Minimum subtotal required (₹)' } },
    { name: 'maxUses', type: 'number', admin: { description: 'Leave empty for unlimited uses' } },
    { name: 'usedCount', type: 'number', defaultValue: 0 },
    { name: 'expiresAt', type: 'date' },
    { name: 'active', type: 'checkbox', defaultValue: true },
  ],
}

export default Discounts
