'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function OrderSuccessContent() {
  const params = useSearchParams()
  const orderId = params.get('orderId')

  return (
    <main style={{ maxWidth: '560px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
      <p style={{ fontSize: '5rem', margin: '0 0 16px' }}>🎉</p>
      <h1 style={{ fontSize: '2rem', marginBottom: '12px' }}>Payment Successful!</h1>
      <p style={{ color: '#666', marginBottom: '8px', lineHeight: '1.6' }}>
        Your order has been placed and payment confirmed.
        We'll send a confirmation to your email shortly.
      </p>
      {orderId && (
        <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '32px' }}>
          Order ID:{' '}
          <code style={{ background: '#f3f3f3', padding: '2px 8px', borderRadius: '4px' }}>
            {orderId}
          </code>
        </p>
      )}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <Link href="/orders" style={{
          background: '#000', color: '#fff', padding: '12px 24px',
          borderRadius: '8px', textDecoration: 'none', fontWeight: '600'
        }}>
          View My Orders
        </Link>
        <Link href="/products" style={{
          border: '1px solid #000', color: '#000', padding: '12px 24px',
          borderRadius: '8px', textDecoration: 'none', fontWeight: '600'
        }}>
          Continue Shopping
        </Link>
      </div>
    </main>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<main style={{ padding: '80px', textAlign: 'center' }}><p>Loading...</p></main>}>
      <OrderSuccessContent />
    </Suspense>
  )
}
