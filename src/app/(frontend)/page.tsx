'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/products?where[inStock][equals]=true&depth=1&limit=8')
      .then(r => r.json())
      .then(data => {
        setProducts(data.docs || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <main style={{ textAlign: 'center', padding: '80px 24px' }}>
      <p style={{ color: '#666' }}>Loading...</p>
    </main>
  )

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '8px' }}>🛍️ My Store</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>Powered by Payload CMS</p>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '48px' }}>
        <Link href="/products" style={{
          background: '#000', color: '#fff',
          padding: '12px 24px', borderRadius: '8px',
          textDecoration: 'none', fontWeight: 'bold'
        }}>
          Browse All Products
        </Link>
        <Link href="/login" style={{
          border: '1px solid #000',
          padding: '12px 24px', borderRadius: '8px',
          textDecoration: 'none', fontWeight: 'bold'
        }}>
          Login
        </Link>
      </div>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Featured Products</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {products.map((product: any) => (   // ✅ was 'featured', now 'products'
          <Link key={product.id} href={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ border: '1px solid #eee', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ background: '#f9f9f9', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', marginBottom: '12px' }}>
                {product.image?.url ? (
                  <img
                    src={product.image.url}  // ✅ removed NEXT_PUBLIC_SERVER_URL prefix
                    alt={product.image.alt || product.name}
                    style={{ width: '100%', height: '200px', objectFit: 'contain', borderRadius: '8px' }}
                  />
                ) : (
                  <span style={{ fontSize: '3rem' }}>📦</span>
                )}
              </div>
              <h3 style={{ fontWeight: '600', margin: '0 0 8px' }}>{product.name}</h3>
              <p style={{ color: '#16a34a', fontWeight: 'bold', margin: 0 }}>₹{product.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
