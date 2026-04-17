'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getImageUrl } from '@/lib/constants'

const COUNTRIES = [
  { code: 'IN', name: 'India' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AE', name: 'UAE' },
]

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [discountCode, setDiscountCode] = useState('')
  const [discountApplied, setDiscountApplied] = useState<{ code: string; amount: number; description: string } | null>(null)
  const [discountLoading, setDiscountLoading] = useState(false)
  const [discountError, setDiscountError] = useState('')
  const [form, setForm] = useState({
    fullName: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: 'IN',
    phone: '',
  })

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('cart') || '[]')
    if (saved.length === 0) {
      router.replace('/cart')
      return
    }
    setCart(saved)

    // Pre-fill name from stored user
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user?.name) setForm(prev => ({ ...prev, fullName: user.name }))
  }, [])

  const SHIPPING_THRESHOLD = 500
  const SHIPPING_COST = 49
  const subtotal = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0)
  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const discount = discountApplied?.amount || 0
  const total = Math.max(0, subtotal - discount + shipping)
  const notes = typeof window !== 'undefined' ? localStorage.getItem('order_notes') || '' : ''

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return
    setDiscountLoading(true)
    setDiscountError('')
    try {
      const res = await fetch('/api/validate-discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode.trim(), subtotal }),
      })
      const data = await res.json()
      if (!res.ok) {
        setDiscountError(data.error || 'Invalid discount code')
        setDiscountApplied(null)
      } else {
        setDiscountApplied({ code: data.code, amount: data.discountAmount, description: data.description })
      }
    } catch {
      setDiscountError('Failed to validate code')
    } finally {
      setDiscountLoading(false)
    }
  }

  const set = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login?redirect=/checkout')
      return
    }

    if (!form.fullName || !form.street || !form.city || !form.zipcode) {
      setError('Please fill in all required fields.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${token}`,
        },
        body: JSON.stringify({
          cartItems: cart.map(item => ({
            id: item.id,
            price: item.price,
            quantity: item.quantity || 1,
            variant: item.variant,
          })),
          shippingAddress: form,
          notes,
          discountCode: discountApplied?.code || '',
          discountAmount: discount,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Checkout failed. Please try again.')
        return
      }

      // Clear cart and notes
      localStorage.removeItem('cart')
      localStorage.removeItem('order_notes')

      // Redirect to DodoPayments hosted checkout (or order-success if no payment configured)
      window.location.href = data.checkout_url
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', border: '1px solid #ddd',
    borderRadius: '8px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '0.9rem',
  }

  return (
    <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>Checkout</h1>
        <Link href="/cart" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to Cart</Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="checkout-grid">

          {/* Shipping Address */}
          <div style={{ border: '1px solid #eee', borderRadius: '12px', padding: '28px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '24px', margin: '0 0 24px' }}>
              Shipping Address
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Full Name *</label>
              <input
                value={form.fullName}
                onChange={e => set('fullName', e.target.value)}
                placeholder="John Doe"
                required
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Phone</label>
              <input
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="+91 9876543210"
                type="tel"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Street Address *</label>
              <input
                value={form.street}
                onChange={e => set('street', e.target.value)}
                placeholder="123 Main Street, Apt 4B"
                required
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>City *</label>
                <input
                  value={form.city}
                  onChange={e => set('city', e.target.value)}
                  placeholder="Mumbai"
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>State</label>
                <input
                  value={form.state}
                  onChange={e => set('state', e.target.value)}
                  placeholder="Maharashtra"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>ZIP / Postal Code *</label>
                <input
                  value={form.zipcode}
                  onChange={e => set('zipcode', e.target.value)}
                  placeholder="400001"
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Country</label>
                <select
                  value={form.country}
                  onChange={e => set('country', e.target.value)}
                  style={{ ...inputStyle, background: '#fff', cursor: 'pointer' }}
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div style={{ border: '1px solid #eee', borderRadius: '12px', padding: '24px', position: 'sticky', top: '80px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 20px' }}>Order Summary</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '44px', height: '44px', background: '#f5f5f5', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {item.image?.url ? (
                      <img src={getImageUrl(item.image.url)} alt={item.name} style={{ width: '44px', height: '44px', objectFit: 'contain', borderRadius: '6px' }} />
                    ) : (
                      <span style={{ fontSize: '1.2rem' }}>📦</span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>Qty: {item.quantity || 1}</p>
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', flexShrink: 0 }}>₹{item.price * (item.quantity || 1)}</span>
                </div>
              ))}
            </div>

            {/* Discount Code */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Discount code"
                  value={discountCode}
                  onChange={e => { setDiscountCode(e.target.value); setDiscountError(''); setDiscountApplied(null) }}
                  style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
                />
                <button
                  type="button"
                  onClick={handleApplyDiscount}
                  disabled={discountLoading || !discountCode.trim()}
                  style={{ padding: '8px 14px', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', opacity: discountLoading ? 0.6 : 1 }}
                >
                  Apply
                </button>
              </div>
              {discountError && <p style={{ color: '#dc2626', fontSize: '0.8rem', margin: '4px 0 0' }}>{discountError}</p>}
              {discountApplied && <p style={{ color: '#16a34a', fontSize: '0.8rem', margin: '4px 0 0' }}>✅ {discountApplied.description}</p>}
            </div>

            <div style={{ borderTop: '1px solid #eee', paddingTop: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#666' }}>
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#16a34a' }}>
                  <span>Discount ({discountApplied?.code})</span>
                  <span>−₹{discount}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#666' }}>
                <span>Shipping</span>
                <span style={{ color: shipping === 0 ? '#16a34a' : '#000' }}>
                  {shipping === 0 ? 'Free' : `₹${shipping}`}
                </span>
              </div>
              {shipping > 0 && (
                <p style={{ margin: '0 0 8px', fontSize: '0.75rem', color: '#888' }}>
                  Add ₹{SHIPPING_THRESHOLD - subtotal} more for free shipping
                </p>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem', marginTop: '12px' }}>
                <span>Total</span>
                <span style={{ color: '#16a34a' }}>₹{total}</span>
              </div>
            </div>

            {error && (
              <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem', lineHeight: '1.5' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px',
                background: loading ? '#666' : '#000',
                color: '#fff', border: 'none', borderRadius: '10px',
                fontSize: '1rem', fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Redirecting to payment...' : `Pay ₹${total} →`}
            </button>

            <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.75rem', color: '#999' }}>
              Secured by DodoPayments
            </p>
          </div>
        </div>
      </form>
    </main>
  )
}
