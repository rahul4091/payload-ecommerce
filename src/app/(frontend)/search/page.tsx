'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query) return
    setLoading(true)
    fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000"}/api/products/search?q=${encodeURIComponent(query)}`)
      .then(r => r.json())
      .then(data => {
        setResults(data.results || [])
        setLoading(false)
      })
  }, [query])

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      <Link href="/products" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>
        ← Back to Products
      </Link>

      <h1 style={{ fontSize: '2rem', margin: '8px 0 24px' }}>
        Search results for <span style={{ color: '#16a34a' }}>"{query}"</span>
      </h1>

      {loading && <p style={{ color: '#666' }}>Searching...</p>}

      {!loading && results.length === 0 && query && (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ fontSize: '3rem' }}>😕</p>
          <p style={{ color: '#666' }}>No products found for "{query}"</p>
          <Link href="/products" style={{
            background: '#000', color: '#fff', padding: '12px 24px',
            borderRadius: '8px', textDecoration: 'none', fontWeight: '600',
            display: 'inline-block', marginTop: '16px'
          }}>
            Browse All Products
          </Link>
        </div>
      )}

      {results.length > 0 && (
        <>
          <p style={{ color: '#666', marginBottom: '24px' }}>{results.length} products found</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {results.map((product: any) => (
              <Link key={product.id} href={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <div style={{ background: '#f9f9f9', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {product.image?.url ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000"}${product.image.url}`}
                        alt={product.name}
                        style={{ width: '100%', height: '200px', objectFit: 'contain' }}
                      />
                    ) : (
                      <span style={{ fontSize: '3rem' }}>📦</span>
                    )}
                  </div>
                  <div style={{ padding: '16px' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: '600', margin: '0 0 8px' }}>{product.name}</h2>
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
        </>
      )}
    </main>
  )
}
