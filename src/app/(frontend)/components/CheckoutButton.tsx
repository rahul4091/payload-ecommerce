'use client'

import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useRouter } from 'next/navigation'
import { createOrder } from '@/lib/api'

export default function CheckoutButton() {
  const { items, totalPrice, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleCheckout = async () => {
    // Check if logged in
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')

    if (!token || !user) {
      router.push('/login')
      return
    }

    const parsedUser = JSON.parse(user)

    setLoading(true)
    setError('')

    try {
      // First find or create customer record matching logged in user
      const customerRes = await fetch(
        `http://localhost:3000/api/customers?where[email][equals]=${parsedUser.email}`,
        { headers: { Authorization: `JWT ${token}` } }
      )
      const customerData = await customerRes.json()

      let customerId

      if (customerData.docs.length > 0) {
        // Customer exists
        customerId = customerData.docs[0].id
      } else {
        // Create customer
        const newCustomer = await fetch('http://localhost:3000/api/customers', {
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

      // Create the order
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
