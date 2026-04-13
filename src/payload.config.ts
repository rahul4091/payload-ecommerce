import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import Products from './collections/Products'
import Categories from './collections/Categories'
import Customers from './collections/Customers'
import Orders from './collections/Orders'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  // ✅ Fallback to localhost if env var missing
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',

  cors: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://payload-ecommerce-eight.vercel.app',
    'https://payload-ecommerce-rahuls-projects-db206c04.vercel.app',
  ],

  csrf: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://payload-ecommerce-eight.vercel.app',
    'https://payload-ecommerce-rahuls-projects-db206c04.vercel.app',
  ],

  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },

  email: nodemailerAdapter({
    defaultFromAddress: process.env.EMAIL_FROM || 'noreply@mystore.com',
    defaultFromName: 'My Store',
    transportOptions: {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 2525,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
  }),

  collections: [Users, Media, Products, Categories, Customers, Orders],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),

  sharp,
  plugins: [],
})
