'use client'

import { useCart } from '../context/CartContext'

export default function AddToCartButton({ product }: { product: any }) {
  const { addToCart } = useCart()

  return (
    <button
      onClick={() => addToCart(product)}
      style={{
        flex: 1, padding: '14px', background: '#000', color: '#fff',
        border: 'none', borderRadius: '10px', fontSize: '1rem',
        fontWeight: '600', cursor: 'pointer'
      }}
    >
      Add to Cart 🛒
    </button>
  )
}
