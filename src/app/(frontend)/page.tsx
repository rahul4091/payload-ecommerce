
'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'
import { getFeaturedProducts } from '@/lib/api'

export default async function Home() {
  const featured = await getFeaturedProducts()

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🛍️ My Store</h1>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        {featured?.map((product: any) => (
          <div key={product.id} style={{
            border: '1px solid #eee', borderRadius: '12px',
            padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            {product.image?.url && (
              <img
                src={`http://localhost:3000${product.image.url}`}
                alt={product.image.alt}
                style={{ width: '100%', height: '200px', objectFit: 'contain',
                  borderRadius: '8px', marginBottom: '12px', background: '#f9f9f9' }}
              />
            )}
            <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: '0 0 8px' }}>{product.name}</h3>
            <p style={{ color: '#16a34a', fontWeight: 'bold', margin: 0 }}>₹{product.price}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
