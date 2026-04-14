import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  const payload = await getPayload({ config })

  const res = await fetch('https://dummyjson.com/products?limit=100')
  const data = await res.json()
  const products = data.products

  let updated = 0

  for (const product of products) {
    try {
      // Find existing product
      const existing = await payload.find({
        collection: 'products',
        where: { name: { equals: product.title } },
        overrideAccess: true,
      })

      if (existing.docs.length === 0) continue

      // Re-upload image to Vercel Blob
      let imageId = null
      try {
        const imageRes = await fetch(product.thumbnail)
        const imageBuffer = await imageRes.arrayBuffer()

        const uploaded = await payload.create({
          collection: 'media',
          overrideAccess: true,
          data: { alt: product.title },
          file: {
            data: Buffer.from(imageBuffer),
            mimetype: 'image/jpeg',
            name: `product-${product.id}-v2.jpg`,
            size: imageBuffer.byteLength,
          },
        })
        imageId = uploaded.id
      } catch (imgErr) {
        console.log(`⚠️ Could not upload image for ${product.title}`)
        continue
      }

      // Update product with new image
      await payload.update({
        collection: 'products',
        id: existing.docs[0].id,
        overrideAccess: true,
        data: { image: imageId },
      })

      updated++
      console.log(`✅ Updated image for: ${product.title}`)
    } catch (err) {
      console.error(`❌ Failed: ${product.title}`, err)
    }
  }

  return NextResponse.json({ success: true, updated })
}
