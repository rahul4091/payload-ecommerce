'use client'

import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useRouter } from 'next/navigation'
import { createOrder } from '@/lib/api'

// Relative on client, absolute on server
const BASE_URL = typeof window !== 'undefined'
  ? ''
  : process.env.NEXT_PUBLIC_SERVER_URL || ''

export default function CheckoutButton() {
  const { items, totalPrice, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleCheckout = async () => {
    // ✅ Safe localStorage access
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null

    if (!token || !user) {
      router.push('/login')
      return
    }

    const parsedUser = JSON.parse(user)
    setLoading(true)
    setError('')

    try {
      const customerRes = await fetch(
        `${BASE_URL}/api/customers?where[email][equals]=${parsedUser.email}`,
        { headers: { Authorization: `JWT ${token}` } }
      )
      const customerData = await customerRes.json()

      let customerId

      if (customerData.docs.length > 0) {
        customerId = customerData.docs[0].id
      } else {
        const newCustomer = await fetch(`${BASE_URL}/api/customers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `JWT ${token}`,
          },
          body: JSON.stringify({
            name: parsedUser.email,
            email: parsedUser.email,
          }),
        })
        const newCustomerData = await newCustomer.json()
        customerId = newCustomerData.doc.id
      }

      const order = await createOrder({
        customer: customerId,
        products: items.map(item => item.id),
        status: 'pending',
        total: totalPrice,
        notes: `Order of ${items.length} item(s)`,
      }, token)

      if (order.doc || order.id) {
        clearCart()
        router.push('/order-success')
      } else {
        setError('Failed to place order. Please try again.')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}
      <button
        onClick={handleCheckout}
        disabled={loading}
        style={{
          width: '100%', padding: '14px',
          background: loading ? '#666' : '#000',
          color: '#fff', border: 'none',
          borderRadius: '10px', fontSize: '1rem',
          fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Placing Order...' : 'Checkout →'}
      </button>
    </div>
  )
}
