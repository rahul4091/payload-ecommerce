import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  const payload = await getPayload({ config })

  const res = await fetch('https://dummyjson.com/products?limit=50')
  const data = await res.json()
  const products = data.products

  // Get all categories from Payload
  const allCategories = await payload.find({
    collection: 'categories',
    limit: 100,
    overrideAccess: true,
  })

  // Build category map by name
  const categoryMap: Record<string, string> = {}
  allCategories.docs.forEach((cat: any) => {
    categoryMap[cat.name.toLowerCase()] = cat.id
  })

  console.log('Category map:', categoryMap)

  // Update each product with correct category
  let updated = 0
  for (const product of products) {
    const cleanName = product.category.replace(/-/g, ' ').toLowerCase()
    const catId = categoryMap[cleanName]

    if (!catId) {
      console.log(`⚠️ No category found for: ${cleanName}`)
      continue
    }

    const existing = await payload.find({
      collection: 'products',
      where: { name: { equals: product.title } },
      overrideAccess: true,
    })

    if (existing.docs.length > 0) {
      await payload.update({
        collection: 'products',
        id: existing.docs[0].id,
        overrideAccess: true,
        data: { category: catId },
      })
      updated++
      console.log(`✅ Updated: ${product.title} → ${cleanName}`)
    }
  }

  return NextResponse.json({
    success: true,
    productsUpdated: updated,
    categories: Object.keys(categoryMap),
  })
}
