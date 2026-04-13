'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch all products and categories
    Promise.all([
      fetch(`/api/products?depth=1&limit=100`).then(r => r.json()),
      fetch(`/api/categories?limit=50`).then(r => r.json()),
    ]).then(([productsData, categoriesData]) => {
      setProducts(productsData.docs || [])
      setCategories(categoriesData.docs || [])
      setLoading(false)
    })
  }, [])

  // Filter products by selected category
  const filtered = selectedCategory === 'all'
    ? products
    : products.filter((p: any) => {
        const catId = typeof p.category === 'string' ? p.category : p.category?.id
        return catId === selectedCategory
      })

  if (loading) {
    return (
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px', textAlign: 'center' }}>
        <p style={{ color: '#666' }}>Loading products...</p>
      </main>
    )
  }

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <Link href="/" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to Home</Link>
          <h1 style={{ fontSize: '2rem', margin: '8px 0 0' }}>All Products</h1>
        </div>
        <span style={{ color: '#666', fontSize: '0.9rem' }}>{filtered.length} products</span>
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '32px' }}>
        <button
          onClick={() => setSelectedCategory('all')}
          style={{
            padding: '8px 18px', borderRadius: '999px', border: '1px solid #ddd',
            cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem',
            background: selectedCategory === 'all' ? '#000' : '#fff',
            color: selectedCategory === 'all' ? '#fff' : '#333',
          }}
        >
          All
        </button>
        {categories.map((cat: any) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              padding: '8px 18px', borderRadius: '999px', border: '1px solid #ddd',
              cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500',
              background: selectedCategory === cat.id ? '#000' : '#fff',
              color: selectedCategory === cat.id ? '#fff' : '#333',
              textTransform: 'capitalize',
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
          <p style={{ fontSize: '3rem' }}>😕</p>
          <p>No products in this category</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {filtered.map((product: any) => (
            <Link key={product.id} href={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer' }}>
                <div style={{ background: '#f9f9f9', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {product.image?.url ? (
                    <img
                    src={product.image.url}
                      alt={product.image.alt || product.name}
                      style={{ width: '100%', height: '220px', objectFit: 'contain' }}
                    />
                  ) : (
                    <span style={{ fontSize: '3rem' }}>📦</span>
                  )}
                </div>
                <div style={{ padding: '16px' }}>
                  {product.category && (
                    <span style={{ fontSize: '0.75rem', color: '#888', background: '#f3f3f3', padding: '2px 8px', borderRadius: '999px', marginBottom: '8px', display: 'inline-block', textTransform: 'capitalize' }}>
                      {product.category.name}
                    </span>
                  )}
                  <h2 style={{ fontSize: '1rem', fontWeight: '600', margin: '8px 0' }}>{product.name}</h2>
                  <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 12px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
                    {product.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#16a34a' }}>₹{product.price}</span>
                    <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '999px', background: product.inStock ? '#dcfce7' : '#fee2e2', color: product.inStock ? '#16a34a' : '#dc2626' }}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
