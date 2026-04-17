'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '../context/CartContext'
import WishlistButton from './WishlistButton'

export default function ProductActions({ product }: { product: any }) {
  const { addToCart } = useCart()
  const [selectedVariant, setSelectedVariant] = useState<any>(
    product.variants?.length > 0 ? product.variants[0] : null
  )
  const [added, setAdded] = useState(false)

  const hasVariants = product.variants?.length > 0
  const effectivePrice = selectedVariant?.price ?? product.price
  const effectiveStock = selectedVariant ? selectedVariant.stock : product.stock
  const isOutOfStock = hasVariants
    ? selectedVariant?.stock === 0
    : !product.inStock

  const handleAdd = () => {
    if (isOutOfStock) return
    addToCart(
      { ...product, price: effectivePrice },
      selectedVariant ? { name: selectedVariant.name, price: selectedVariant.price ?? product.price } : undefined
    )
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div>
      {/* Price */}
      <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#16a34a', margin: '0 0 16px' }}>
        ₹{effectivePrice}
      </p>

      {/* Stock badge */}
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <span style={{
          padding: '6px 14px', borderRadius: '999px', fontSize: '0.85rem', fontWeight: '600',
          background: isOutOfStock ? '#fee2e2' : '#dcfce7',
          color: isOutOfStock ? '#dc2626' : '#16a34a',
        }}>
          {isOutOfStock ? '❌ Out of Stock' : '✅ In Stock'}
        </span>
        {!isOutOfStock && typeof effectiveStock === 'number' && effectiveStock <= 10 && (
          <span style={{ fontSize: '0.82rem', color: '#f59e0b', fontWeight: '600' }}>
            Only {effectiveStock} left!
          </span>
        )}
      </div>

      {/* Variant selector */}
      {hasVariants && (
        <div style={{ marginBottom: '24px' }}>
          <p style={{ margin: '0 0 10px', fontWeight: '600', fontSize: '0.9rem' }}>
            {product.variants[0]?.sku ? 'Select Option' : 'Select Variant'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {product.variants.map((v: any) => (
              <button
                key={v.name}
                onClick={() => setSelectedVariant(v)}
                disabled={v.stock === 0}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: selectedVariant?.name === v.name ? '2px solid #000' : '1px solid #ddd',
                  background: selectedVariant?.name === v.name ? '#000' : '#fff',
                  color: selectedVariant?.name === v.name ? '#fff' : v.stock === 0 ? '#bbb' : '#000',
                  fontWeight: '500',
                  fontSize: '0.9rem',
                  cursor: v.stock === 0 ? 'not-allowed' : 'pointer',
                  textDecoration: v.stock === 0 ? 'line-through' : 'none',
                }}
              >
                {v.name}{v.price && v.price !== product.price ? ` (+₹${v.price - product.price})` : ''}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={handleAdd}
          disabled={isOutOfStock}
          style={{
            flex: 1, minWidth: '140px', padding: '14px 20px',
            background: added ? '#16a34a' : isOutOfStock ? '#ccc' : '#000',
            color: '#fff', border: 'none', borderRadius: '10px',
            fontSize: '1rem', fontWeight: '600',
            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
        >
          {added ? '✅ Added!' : '🛒 Add to Cart'}
        </button>
        <Link href="/cart" style={{
          padding: '14px 20px', background: '#fff', color: '#000',
          border: '1px solid #000', borderRadius: '10px',
          fontSize: '1rem', textDecoration: 'none', display: 'flex', alignItems: 'center',
        }}>
          View Cart
        </Link>
        <WishlistButton productId={product.id} />
      </div>
    </div>
  )
}
