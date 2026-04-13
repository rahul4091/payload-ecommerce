import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  const payload = await getPayload({ config })

  // Fetch products from DummyJSON
  const res = await fetch('https://dummyjson.com/products?limit=50')
  const data = await res.json()
  const products = data.products

  const categoryNames = [...new Set(products.map((p: any) => p.category))] as string[]
  const categoryMap: Record<string, string> = {}

for (const name of categoryNames) {
    const cleanName = name.replace(/-/g, ' ')
    const existing = await payload.find({
      collection: 'categories',
      where: { name: { equals: cleanName } },
      overrideAccess: true,
    })

    if (existing.docs.length > 0) {
      categoryMap[name] = existing.docs[0].id
    } else {
      try {
        const created = await payload.create({
          collection: 'categories',
          overrideAccess: true,
          data: { name: cleanName, description: `${cleanName} products` },
        })
        categoryMap[name] = created.id
      } catch (err: any) {
        // 👇 log full error details
        console.error('Category error:', JSON.stringify(err?.data, null, 2))
      }
    }
  }

  let created = 0
  for (const product of products) {
    const existing = await payload.find({
      collection: 'products',
      where: { name: { equals: product.title } },
      overrideAccess: true,
    })

    if (existing.docs.length > 0) continue

    try {
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
            name: `product-${product.id}.jpg`,
            size: imageBuffer.byteLength,
          },
        })
        imageId = uploaded.id
      } catch {}

      await payload.create({
        collection: 'products',
        overrideAccess: true,
        data: {
          name: product.title,
          price: Math.round(product.price * 83),
          description: product.description,
          inStock: product.stock > 0,
          category: categoryMap[product.category],
          ...(imageId && { image: imageId }),
        },
      })
      created++
    } catch (err) {
      console.error(`Failed: ${product.title}`, err)
    }
  }

  return NextResponse.json({ success: true, created })
}
