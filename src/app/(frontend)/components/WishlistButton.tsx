'use client'

import { useState, useEffect } from 'react'

export default function WishlistButton({ productId }: { productId: string }) {
  const [wishlisted, setWishlisted] = useState(false)

  useEffect(() => {
    const ids: string[] = JSON.parse(localStorage.getItem('wishlist') || '[]')
    setWishlisted(ids.includes(productId))
  }, [productId])

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const ids: string[] = JSON.parse(localStorage.getItem('wishlist') || '[]')
    const updated = ids.includes(productId)
      ? ids.filter(id => id !== productId)
      : [...ids, productId]
    localStorage.setItem('wishlist', JSON.stringify(updated))
    setWishlisted(!wishlisted)
    window.dispatchEvent(new Event('wishlist-change'))
  }

  return (
    <button
      onClick={toggle}
      title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      style={{
        width: '46px', height: '46px',
        borderRadius: '10px', border: '1px solid #ddd',
        background: wishlisted ? '#fff0f0' : '#fff',
        cursor: 'pointer', fontSize: '1.3rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        transition: 'background 0.15s',
      }}
    >
      {wishlisted ? '❤️' : '🤍'}
    </button>
  )
}
