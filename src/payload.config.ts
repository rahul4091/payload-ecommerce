import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import Products from './collections/Products'
import Categories from './collections/Categories'
import Customers from './collections/Customers'
import Orders from './collections/Orders'
import Reviews from './collections/Reviews'
import Wishlists from './collections/Wishlists'
import Discounts from './collections/Discounts'


const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  cors: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://payload-ecommerce-eight.vercel.app',
    'https://payload-ecommerce-rahuls-projects-db206c04.vercel.app',
    /https:\/\/payload-ecommerce.*\.vercel\.app/,  // ✅ covers all preview deployments
  ],
  csrf: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://payload-ecommerce-eight.vercel.app',
    'https://payload-ecommerce-rahuls-projects-db206c04.vercel.app',
    /https:\/\/payload-ecommerce.*\.vercel\.app/,  // ✅ covers all preview deployments
  ],
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(process.cwd(), 'src'), // ✅ fixed — dirname is unreliable on Vercel
    },
  },
  ...(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
    ? {
        email: nodemailerAdapter({
          defaultFromAddress: process.env.EMAIL_FROM || 'onboarding@resend.dev',
          defaultFromName: 'My Store',
          transportOptions: {
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 465,
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          },
        }),
      }
    : {}),
collections: [Users, Media, Products, Categories, Customers, Orders, Reviews, Wishlists, Discounts],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  sharp,
  plugins: [
    vercelBlobStorage({
      enabled: true,
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
  ],
})
