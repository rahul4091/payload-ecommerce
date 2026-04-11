import Link from 'next/link'

export default function OrderSuccessPage() {
  return (
    <main style={{ maxWidth: '600px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
      <p style={{ fontSize: '5rem', margin: '0 0 16px' }}>🎉</p>
      <h1 style={{ fontSize: '2rem', marginBottom: '12px' }}>Order Placed!</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Your order has been successfully placed and is now <strong>pending</strong>.
        You can track it in your account.
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <Link href="/products" style={{
          background: '#000', color: '#fff', padding: '12px 24px',
          borderRadius: '8px', textDecoration: 'none', fontWeight: '600'
        }}>
          Continue Shopping
        </Link>
      </div>
    </main>
  )
}
