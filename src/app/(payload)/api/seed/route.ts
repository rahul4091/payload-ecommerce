import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Seed route is disabled in production' }, { status: 404 })
  }
  return _seedHandler()
}

async function uploadImage(payload: any, imageUrl: string, name: string, index: number) {
  try {
    const imageRes = await fetch(imageUrl)
    if (!imageRes.ok) return null
    const imageBuffer = await imageRes.arrayBuffer()
    const uploaded = await payload.create({
      collection: 'media',
      overrideAccess: true,
      data: { alt: name },
      file: {
        data: Buffer.from(imageBuffer),
        mimetype: 'image/jpeg',
        name: `product-all-${index}-${Date.now()}.jpg`,
        size: imageBuffer.byteLength,
      },
    })
    return uploaded.id
  } catch {
    return null
  }
}

async function getOrCreateCategory(payload: any, name: string) {
  const cleanName = name.replace(/-/g, ' ').toLowerCase()
  const existing = await payload.find({
    collection: 'categories',
    where: { name: { equals: cleanName } },
    overrideAccess: true,
  })
  if (existing.docs.length > 0) return existing.docs[0].id

  const created = await payload.create({
    collection: 'categories',
    overrideAccess: true,
    data: { name: cleanName, description: `${cleanName} products` },
  })
  return created.id
}

async function productExists(payload: any, name: string) {
  const existing = await payload.find({
    collection: 'products',
    where: { name: { equals: name } },
    overrideAccess: true,
  })
  return existing.docs.length > 0
}

async function _seedHandler() {
  const payload = await getPayload({ config })
  let totalCreated = 0
  const results: any = {}

  // ─── 1. DummyJSON (194 products) ───────────────────────────────
  try {
    console.log('🌱 Seeding DummyJSON...')
    const res = await fetch('https://dummyjson.com/products?limit=194')
    const data = await res.json()
    let created = 0

    for (const [i, product] of data.products.entries()) {
      if (await productExists(payload, product.title)) continue
      const catId = await getOrCreateCategory(payload, product.category)
      const imageId = await uploadImage(payload, product.thumbnail, product.title, i)
      await payload.create({
        collection: 'products',
        overrideAccess: true,
        data: {
          name: product.title,
          price: Math.round(product.price * 83),
          description: product.description,
          inStock: product.stock > 0,
          category: catId,
          ...(imageId && { image: imageId }),
        },
      })
      created++
    }
    results.dummyJSON = created
    totalCreated += created
    console.log(`✅ DummyJSON: ${created} products`)
  } catch (err) {
    results.dummyJSON = `Error: ${err}`
  }

  // ─── 2. Fake Store API (20 products) ───────────────────────────
  try {
    console.log('🌱 Seeding Fake Store API...')
    const res = await fetch('https://fakestoreapi.com/products')
    const products = await res.json()
    let created = 0

    for (const [i, product] of products.entries()) {
      if (await productExists(payload, product.title)) continue
      const catId = await getOrCreateCategory(payload, product.category)
      const imageId = await uploadImage(payload, product.image, product.title, i + 200)
      await payload.create({
        collection: 'products',
        overrideAccess: true,
        data: {
          name: product.title,
          price: Math.round(product.price * 83),
          description: product.description,
          inStock: true,
          category: catId,
          ...(imageId && { image: imageId }),
        },
      })
      created++
    }
    results.fakeStore = created
    totalCreated += created
    console.log(`✅ Fake Store: ${created} products`)
  } catch (err) {
    results.fakeStore = `Error: ${err}`
  }

  // ─── 3. Platzi Fake Store API (200 products) ───────────────────
  try {
    console.log('🌱 Seeding Platzi Fake Store...')
    const res = await fetch('https://api.escuelajs.co/api/v1/products?offset=0&limit=100')
    const products = await res.json()
    let created = 0

    for (const [i, product] of products.entries()) {
      if (!product.title || await productExists(payload, product.title)) continue
      const catName = product.category?.name || 'general'
      const catId = await getOrCreateCategory(payload, catName)

      // Platzi has array of images
      const imageUrl = Array.isArray(product.images)
        ? product.images[0]?.replace(/[\[\]"]/g, '')
        : null

      let imageId = null
      if (imageUrl && imageUrl.startsWith('http')) {
        imageId = await uploadImage(payload, imageUrl, product.title, i + 300)
      }

      await payload.create({
        collection: 'products',
        overrideAccess: true,
        data: {
          name: product.title,
          price: Math.round((product.price || 10) * 83),
          description: product.description || product.title,
          inStock: true,
          category: catId,
          ...(imageId && { image: imageId }),
        },
      })
      created++
    }
    results.platzi = created
    totalCreated += created
    console.log(`✅ Platzi: ${created} products`)
  } catch (err) {
    results.platzi = `Error: ${err}`
  }

  // ─── 4. Open Food Facts (grocery products) ─────────────────────
  try {
    console.log('🌱 Seeding Open Food Facts...')
    const res = await fetch(
      'https://world.openfoodfacts.org/cgi/search.pl?search_terms=snack&json=1&page_size=30&fields=product_name,image_url,categories_tags,quantity'
    )
    const data = await res.json()
    const products = data.products || []
    let created = 0

    for (const [i, product] of products.entries()) {
      const name = product.product_name
      if (!name || name.length < 3) continue
      if (await productExists(payload, name)) continue

      const catId = await getOrCreateCategory(payload, 'food & snacks')

      let imageId = null
      if (product.image_url) {
        imageId = await uploadImage(payload, product.image_url, name, i + 500)
      }

      await payload.create({
        collection: 'products',
        overrideAccess: true,
        data: {
          name,
          price: Math.round(Math.random() * 500 + 50), // random price ₹50-₹550
          description: `${name} — ${product.quantity || ''}`.trim(),
          inStock: true,
          category: catId,
          ...(imageId && { image: imageId }),
        },
      })
      created++
    }
    results.openFoodFacts = created
    totalCreated += created
    console.log(`✅ Open Food Facts: ${created} products`)
  } catch (err) {
    results.openFoodFacts = `Error: ${err}`
  }

  return NextResponse.json({
    success: true,
    totalCreated,
    breakdown: results,
  })
}
