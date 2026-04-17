'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getImageUrl } from '@/lib/constants'

export default function WishlistPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadWishlist = async () => {
    const ids: string[] = JSON.parse(localStorage.getItem('wishlist') || '[]')
    if (ids.length === 0) { setProducts([]); setLoading(false); return }
    try {
      const results = await Promise.all(
        ids.map(id => fetch(`/api/products/${id}?depth=1`).then(r => r.ok ? r.json() : null))
      )
      setProducts(results.filter(Boolean))
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWishlist()
    window.addEventListener('wishlist-change', loadWishlist)
    return () => window.removeEventListener('wishlist-change', loadWishlist)
  }, [])

  const remove = (id: string) => {
    const ids: string[] = JSON.parse(localStorage.getItem('wishlist') || '[]')
    localStorage.setItem('wishlist', JSON.stringify(ids.filter(i => i !== id)))
    setProducts(prev => prev.filter(p => p.id !== id))
    window.dispatchEvent(new Event('wishlist-change'))
  }

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>My Wishlist</h1>
        <Link href="/products" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>← Continue Shopping</Link>
      </div>

      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ height: '200px', background: '#f0f0f0', animation: 'pulse 1.5s ease-in-out infinite' }} />
              <div style={{ padding: '16px' }}>
                <div style={{ height: '14px', width: '70%', background: '#f0f0f0', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
              </div>
              <style>{`@keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }`}</style>
            </div>
          ))}
        </div>
      )}

      {!loading && products.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <p style={{ fontSize: '4rem', marginBottom: '16px' }}>🤍</p>
          <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '24px' }}>Your wishlist is empty</p>
          <Link href="/products" style={{ background: '#000', color: '#fff', padding: '12px 28px', borderRadius: '10px', textDecoration: 'none', fontWeight: '600' }}>
            Browse Products
          </Link>
        </div>
      )}

      {!loading && products.length > 0 && (
        <>
          <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '20px' }}>{products.length} item{products.length !== 1 ? 's' : ''}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
            {products.map(product => (
              <div key={product.id} style={{ border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', position: 'relative' }}>
                <button
                  onClick={() => remove(product.id)}
                  title="Remove from wishlist"
                  style={{
                    position: 'absolute', top: '10px', right: '10px', zIndex: 1,
                    width: '32px', height: '32px', borderRadius: '999px',
                    background: '#fff', border: '1px solid #ddd', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                  }}
                >
                  ×
                </button>
                <Link href={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <div style={{ background: '#f9f9f9', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {product.image?.url ? (
                      <img src={getImageUrl(product.image.url)} alt={product.image.alt || product.name} style={{ width: '100%', height: '200px', objectFit: 'contain' }} />
                    ) : (
                      <span style={{ fontSize: '3rem' }}>📦</span>
                    )}
                  </div>
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
                        fontSize: '0.75rem', fontWeight: '600', padding: '2px 10px', borderRadius: '999px',
                        background: product.inStock ? '#dcfce7' : '#fee2e2',
                        color: product.inStock ? '#16a34a' : '#dc2626',
                      }}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  )
}
