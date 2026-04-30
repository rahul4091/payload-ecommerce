import { getPayload, Payload } from 'payload'
import config from '../../src/payload.config.js'

import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload

describe('API', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  afterAll(async () => {
    // Clean up any test data created during these tests
    await payload.delete({ collection: 'discounts', where: { code: { equals: 'TESTCODE50' } } })
    await payload.delete({ collection: 'categories', where: { name: { equals: 'test-category' } } })
  })

  it('fetches users collection', async () => {
    const users = await payload.find({ collection: 'users' })
    expect(users).toBeDefined()
    expect(Array.isArray(users.docs)).toBe(true)
  })

  it('fetches products collection', async () => {
    const products = await payload.find({ collection: 'products' })
    expect(products).toBeDefined()
    expect(typeof products.totalDocs).toBe('number')
  })

  it('fetches categories collection', async () => {
    const categories = await payload.find({ collection: 'categories' })
    expect(categories).toBeDefined()
    expect(Array.isArray(categories.docs)).toBe(true)
  })

  it('creates and reads a discount', async () => {
    const discount = await payload.create({
      collection: 'discounts',
      overrideAccess: true,
      data: {
        code: 'TESTCODE50',
        type: 'percentage',
        value: 50,
        active: true,
      },
    })
    expect(discount.code).toBe('TESTCODE50')
    expect(discount.type).toBe('percentage')
    expect(discount.value).toBe(50)

    const found = await payload.find({
      collection: 'discounts',
      where: { code: { equals: 'TESTCODE50' } },
    })
    expect(found.docs.length).toBe(1)
  })

  it('creates a category', async () => {
    const category = await payload.create({
      collection: 'categories',
      overrideAccess: true,
      data: { name: 'test-category' },
    })
    expect(category.name).toBe('test-category')
  })

  it('products inStock is synced with stock in beforeChange hook', async () => {
    const product = await payload.create({
      collection: 'products',
      overrideAccess: true,
      data: { name: 'Hook Test Product', price: 100, stock: 0 },
    })
    expect(product.inStock).toBe(false)

    const updated = await payload.update({
      collection: 'products',
      id: product.id,
      overrideAccess: true,
      data: { stock: 5 },
    })
    expect(updated.inStock).toBe(true)

    await payload.delete({ collection: 'products', id: product.id, overrideAccess: true })
  })
})
