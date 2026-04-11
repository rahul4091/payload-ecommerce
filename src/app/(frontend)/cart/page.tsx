'use client'

import { useCart } from '../context/CartContext'
import Link from 'next/link'
import CheckoutButton from '../components/CheckoutButton' // 👈 add this

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: '4rem' }}>🛒</p>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '16px' }}>Your cart is empty</h1>
        <Link href="/products" style={{
          background: '#000', color: '#fff', padding: '12px 24px',
          borderRadius: '8px', textDecoration: 'none', fontWeight: '600'
        }}>
          Browse Products
        </Link>
      </main>
    )
  }

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', margin: 0 }}>Your Cart 🛒</h1>
        <button onClick={clearCart} style={{
          background: 'none', border: '1px solid #ddd', padding: '8px 16px',
          borderRadius: '8px', cursor: 'pointer', color: '#666'
        }}>
          Clear Cart
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        {items.map(item => (
          <div key={item.id} style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            border: '1px solid #eee', borderRadius: '12px', padding: '16px'
          }}>
            <div style={{ width: '80px', height: '80px', background: '#f9f9f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {item.image ? (
                <img src={`http://localhost:3000${item.image}`} alt={item.name}
                  style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '8px' }} />
              ) : (
                <span style={{ fontSize: '2rem' }}>📦</span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '1rem' }}>{item.name}</h3>
              <p style={{ margin: 0, color: '#16a34a', fontWeight: 'bold' }}>₹{item.price}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                style={{ width: '32px', height: '32px', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', background: '#fff', fontSize: '1rem' }}>−</button>
              <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: '600' }}>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                style={{ width: '32px', height: '32px', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', background: '#fff', fontSize: '1rem' }}>+</button>
            </div>
            <p style={{ minWidth: '80px', textAlign: 'right', fontWeight: 'bold', margin: 0 }}>
              ₹{item.price * item.quantity}
            </p>
            <button onClick={() => removeFromCart(item.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '1.2rem' }}>✕</button>
          </div>
        ))}
      </div>

      <div style={{ border: '1px solid #eee', borderRadius: '12px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span style={{ fontSize: '1.2rem' }}>Total</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#16a34a' }}>₹{totalPrice}</span>
        </div>
        <CheckoutButton /> {/* 👈 replaced */}
        <Link href="/products" style={{
          display: 'block', textAlign: 'center', marginTop: '12px',
          color: '#666', textDecoration: 'none', fontSize: '0.9rem'
        }}>
          ← Continue Shopping
        </Link>
      </div>
    </main>
  )
}
