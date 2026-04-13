'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getImageUrl } from '@/lib/constants'

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [notes, setNotes] = useState('')
  const router = useRouter()

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('cart') || '[]')
    setCart(saved)
  }, [])

  const updateQty = (id: string, delta: number) => {
    const updated = cart.map(item => {
      if (item.id !== id) return item
      const newQty = (item.quantity || 1) + delta
      return newQty < 1 ? null : { ...item, quantity: newQty }
    }).filter(Boolean) as any[]
    setCart(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
  }

  const removeItem = (id: string) => {
    const updated = cart.filter(item => item.id !== id)
    setCart(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
  }

  const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0)

  const handleCheckout = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    // ✅ Get customer id from stored user
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user?.id) {
      router.push('/login')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${token}`,
        },
        body: JSON.stringify({
          customer: user.id,                    // ✅ required field — was missing
          products: cart.map(item => item.id),
          total,
          status: 'pending',
          notes,
        }),
      })

      if (res.ok) {
        localStorage.removeItem('cart')
        setCart([])
        setOrderPlaced(true)
      } else {
        const err = await res.json()
        alert(err?.errors?.[0]?.message || 'Failed to place order. Please try again.')
      }
    } catch {
      alert('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (orderPlaced) return (
    <main style={{ maxWidth: '600px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
      <p style={{ fontSize: '4rem' }}>🎉</p>
      <h1 style={{ fontSize: '2rem', marginBottom: '16px' }}>Order Placed!</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>Thanks for your order. You can track it in your orders page.</p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <Link href="/orders" style={{ background: '#000', color: '#fff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>View Orders</Link>
        <Link href="/products" style={{ border: '1px solid #000', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>Continue Shopping</Link>
      </div>
    </main>
  )

  if (cart.length === 0) return (
    <main style={{ maxWidth: '600px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
      <p style={{ fontSize: '4rem' }}>🛒</p>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '16px' }}>Your cart is empty</h1>
      <Link href="/products" style={{ background: '#000', color: '#fff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>Browse Products</Link>
    </main>
  )

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>Your Cart 🛒</h1>
        <Link href="/products" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>← Continue Shopping</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {cart.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid #eee', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '80px', height: '80px', background: '#f9f9f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {item.image?.url ? (
                  <img src={getImageUrl(item.image.url)} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '8px' }} />
                ) : (
                  <span style={{ fontSize: '2rem' }}>📦</span>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 4px', fontWeight: '600' }}>{item.name}</p>
                <p style={{ margin: 0, color: '#16a34a', fontWeight: 'bold' }}>₹{item.price}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button onClick={() => updateQty(item.id, -1)} style={{ width: '32px', height: '32px', border: '1px solid #ddd', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '1.1rem' }}>−</button>
                <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: '600' }}>{item.quantity || 1}</span>
                <button onClick={() => updateQty(item.id, 1)} style={{ width: '32px', height: '32px', border: '1px solid #ddd', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '1.1rem' }}>+</button>
              </div>
              <p style={{ minWidth: '80px', textAlign: 'right', fontWeight: 'bold', margin: 0 }}>₹{item.price * (item.quantity || 1)}</p>
              <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '1.2rem', padding: '4px' }}>🗑️</button>
            </div>
          ))}
        </div>

        <div style={{ border: '1px solid #eee', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', position: 'sticky', top: '80px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Order Summary</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#666' }}>
                <span>{item.name} × {item.quantity || 1}</span>
                <span>₹{item.price * (item.quantity || 1)}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #eee', paddingTop: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem' }}>
              <span>Total</span>
              <span style={{ color: '#16a34a' }}>₹{total}</span>
            </div>
          </div>
          <textarea
            placeholder="Add a note for your order (optional)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '16px', resize: 'none', outline: 'none', boxSizing: 'border-box' }}
          />
          <button
            onClick={handleCheckout}
            disabled={loading}
            style={{ width: '100%', padding: '14px', background: loading ? '#666' : '#000', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Placing Order...' : 'Place Order →'}
          </button>
          <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.8rem', color: '#999' }}>You'll be asked to login if not already</p>
        </div>
      </div>
    </main>
  )
}
