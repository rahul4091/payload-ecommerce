
import payload from 'payload'
import config from './payload.config'

async function seed() {
  // Initialize Payload
  await payload.init({ config })

  console.log('🌱 Starting seed...')

  // Fetch products from DummyJSON
  const res = await fetch('https://dummyjson.com/products?limit=50')
  const data = await res.json()
  const products = data.products

  console.log(`📦 Fetched ${products.length} products from DummyJSON`)

  // Get unique categories
  const categoryNames = [...new Set(products.map((p: any) => p.category))] as string[]
  console.log(`📁 Found ${categoryNames.length} categories:`, categoryNames)

  // Create categories in Payload
  const categoryMap: Record<string, string> = {}

  for (const name of categoryNames) {
    const existing = await payload.find({
      collection: 'categories',
      where: { name: { equals: name } },
    })

    if (existing.docs.length > 0) {
      categoryMap[name] = existing.docs[0].id
      console.log(`✅ Category exists: ${name}`)
    } else {
      const created = await payload.create({
        collection: 'categories',
        data: { name, description: `${name} products` },
      })
      categoryMap[name] = created.id
      console.log(`✅ Created category: ${name}`)
    }
  }

  // Create products in Payload
  let created = 0
  let skipped = 0

  for (const product of products) {
    // Check if product already exists
    const existing = await payload.find({
      collection: 'products',
      where: { name: { equals: product.title } },
    })

    if (existing.docs.length > 0) {
      console.log(`⏭️  Skipping existing: ${product.title}`)
      skipped++
      continue
    }

    try {
      // Download and upload image to Payload media
      let imageId = null
      try {
        const imageRes = await fetch(product.thumbnail)
        const imageBuffer = await imageRes.arrayBuffer()
        const imageBlob = new Blob([imageBuffer])
        const formData = new FormData()
        formData.append('file', imageBlob, `${product.id}.jpg`)
        formData.append('alt', product.title)

        const uploadedImage = await payload.create({
          collection: 'media',
          data: { alt: product.title },
          file: {
            data: Buffer.from(imageBuffer),
            mimetype: 'image/jpeg',
            name: `product-${product.id}.jpg`,
            size: imageBuffer.byteLength,
          },
        })
        imageId = uploadedImage.id
      } catch (imgErr) {
        console.log(`⚠️  Could not upload image for ${product.title}`)
      }

      // Create product
      await payload.create({
        collection: 'products',
        data: {
          name: product.title,
          price: Math.round(product.price * 83), // convert USD to INR
          description: product.description,
          inStock: product.stock > 0,
          category: categoryMap[product.category],
          ...(imageId && { image: imageId }),
        },
      })

      console.log(`✅ Created: ${product.title} — ₹${Math.round(product.price * 83)}`)
      created++
    } catch (err) {
      console.error(`❌ Failed to create ${product.title}:`, err)
    }
  }

  console.log(`\n🎉 Seed complete!`)
  console.log(`✅ Created: ${created} products`)
  console.log(`⏭️  Skipped: ${skipped} products`)
  process.exit(0)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
