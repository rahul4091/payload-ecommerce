'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getImageUrl } from '@/lib/constants'

export default function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/products/${id}?depth=2`)
      .then(r => {
        if (!r.ok) throw new Error('Not found')
        return r.json()
      })
      .then(data => {
        if (data?.errors || data?.error) throw new Error('Not found')
        setProduct(data)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [id])

  const handleAddToCart = () => {
    if (!product) return
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existing = cart.find((i: any) => i.id === product.id)
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1
    } else {
      cart.push({ ...product, quantity: 1 })
    }
    localStorage.setItem('cart', JSON.stringify(cart))
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) return (
    <main style={{ padding: '80px 24px', textAlign: 'center' }}>
      <p style={{ color: '#666' }}>Loading product...</p>
    </main>
  )

  if (error || !product) return (
    <main style={{ padding: '80px 24px', textAlign: 'center' }}>
      <p style={{ fontSize: '3rem' }}>😕</p>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '16px' }}>Product not found</h1>
      <Link href="/products" style={{
        background: '#000', color: '#fff', padding: '12px 24px',
        borderRadius: '8px', textDecoration: 'none', fontWeight: '600'
      }}>
        ← Back to Products
      </Link>
    </main>
  )

  return (
    <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
      <Link href="/products" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>
        ← Back to Products
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginTop: '24px' }}>

        {/* Image */}
        <div style={{
          background: '#f9f9f9', borderRadius: '16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px'
        }}>
          {product.image?.url ? (
            <img
              src={getImageUrl(product.image.url)}
              alt={product.image.alt || product.name}
              style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '16px' }}
            />
          ) : (
            <span style={{ fontSize: '5rem' }}>📦</span>
          )}
        </div>

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {product.category?.name && (
            <span style={{
              fontSize: '0.8rem', color: '#888', background: '#f3f3f3',
              padding: '4px 12px', borderRadius: '999px',
              display: 'inline-block', marginBottom: '16px', width: 'fit-content'
            }}>
              📁 {product.category.name}
            </span>
          )}

          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0 0 16px' }}>{product.name}</h1>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#16a34a', margin: '0 0 16px' }}>₹{product.price}</p>

          <div style={{ marginBottom: '24px' }}>
            <span style={{
              padding: '6px 14px', borderRadius: '999px', fontSize: '0.85rem', fontWeight: '600',
              background: product.inStock ? '#dcfce7' : '#fee2e2',
              color: product.inStock ? '#16a34a' : '#dc2626'
            }}>
              {product.inStock ? '✅ In Stock' : '❌ Out of Stock'}
            </span>
          </div>

          {product.description && (
            <p style={{ color: '#555', lineHeight: '1.7', marginBottom: '32px', whiteSpace: 'pre-line' }}>
              {product.description}
            </p>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              style={{
                flex: 1, padding: '14px 20px',
                background: added ? '#16a34a' : (product.inStock ? '#000' : '#ccc'),
                color: '#fff', border: 'none', borderRadius: '10px',
                fontSize: '1rem', fontWeight: '600',
                cursor: product.inStock ? 'pointer' : 'not-allowed',
                transition: 'background 0.2s'
              }}
            >
              {added ? '✅ Added to Cart!' : '🛒 Add to Cart'}
            </button>
            <Link href="/cart" style={{
              padding: '14px 20px', background: '#fff', color: '#000',
              border: '1px solid #000', borderRadius: '10px',
              fontSize: '1rem', textDecoration: 'none', display: 'flex', alignItems: 'center'
            }}>
              View Cart
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
