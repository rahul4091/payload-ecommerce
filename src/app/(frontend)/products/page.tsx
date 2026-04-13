'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getImageUrl } from '@/lib/constants'

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/categories?limit=100')
      .then(r => r.json())
      .then(data => setCategories(data.docs || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    let url = '/api/products?depth=1&limit=24'
    if (category) url += `&where[category][equals]=${category}`

    fetch(url)
      .then(r => r.json())
      .then(data => {
        setProducts(data.docs || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [category])

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>All Products</h1>
        <Link href="/" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to Home</Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="🔍 Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: '200px', padding: '10px 16px',
            border: '1px solid #ddd', borderRadius: '8px',
            fontSize: '0.95rem', outline: 'none'
          }}
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          style={{
            padding: '10px 16px', border: '1px solid #ddd',
            borderRadius: '8px', fontSize: '0.95rem',
            background: '#fff', cursor: 'pointer', outline: 'none'
          }}
        >
          <option value="">All Categories</option>
          {categories.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#666' }}>
          <p>Loading products...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <p style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</p>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>No products found</p>
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ marginTop: '12px', padding: '8px 20px', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {/* Grid */}
      {!loading && filtered.length > 0 && (
        <>
          <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '20px' }}>
            {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
            {filtered.map((product: any) => (
              <Link key={product.id} href={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{
                  border: '1px solid #eee', borderRadius: '12px',
                  overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'
                    ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
                    ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'
                  }}
                >
                  {/* Image */}
                  <div style={{ background: '#f9f9f9', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {product.image?.url ? (
                      <img
                        src={getImageUrl(product.image.url)}
                        alt={product.image.alt || product.name}
                        style={{ width: '100%', height: '200px', objectFit: 'contain' }}
                      />
                    ) : (
                      <span style={{ fontSize: '3rem' }}>📦</span>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: '16px' }}>
                    {product.category?.name && (
                      <span style={{ fontSize: '0.75rem', color: '#888', background: '#f3f3f3', padding: '2px 10px', borderRadius: '999px' }}>
                        {product.category.name}
                      </span>
                    )}
                    <h3 style={{ fontWeight: '600', margin: '8px 0 4px', fontSize: '1rem' }}>{product.name}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ color: '#16a34a', fontWeight: 'bold', margin: 0 }}>₹{product.price}</p>
                      <span style={{
                        fontSize: '0.75rem', fontWeight: '600',
                        padding: '2px 10px', borderRadius: '999px',
                        background: product.inStock ? '#dcfce7' : '#fee2e2',
                        color: product.inStock ? '#16a34a' : '#dc2626'
                      }}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </main>
  )
}
