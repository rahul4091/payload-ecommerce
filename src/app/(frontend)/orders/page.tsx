'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetch('http://localhost:3000/api/orders?depth=2', {
      headers: { Authorization: `JWT ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setOrders(data.docs || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const statusColors: any = {
    pending: { bg: '#fef9c3', color: '#854d0e' },
    processing: { bg: '#dbeafe', color: '#1e40af' },
    shipped: { bg: '#e0f2fe', color: '#0369a1' },
    delivered: { bg: '#dcfce7', color: '#166534' },
    cancelled: { bg: '#fee2e2', color: '#991b1b' },
  }

  if (loading) {
    return (
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <p style={{ color: '#666' }}>Loading your orders...</p>
      </main>
    )
  }

  if (orders.length === 0) {
    return (
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: '4rem' }}>📦</p>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '16px' }}>No orders yet</h1>
        <Link href="/products" style={{
          background: '#000', color: '#fff', padding: '12px 24px',
          borderRadius: '8px', textDecoration: 'none', fontWeight: '600'
        }}>
          Start Shopping
        </Link>
      </main>
    )
  }

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '32px' }}>My Orders 📦</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {orders.map((order: any) => {
          const status = order.status || 'pending'
          const colors = statusColors[status] || statusColors.pending

          return (
            <div key={order.id} style={{
              border: '1px solid #eee', borderRadius: '12px',
              overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              {/* Order Header */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px 20px', background: '#f9f9f9', borderBottom: '1px solid #eee'
              }}>
                <div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>ORDER ID</p>
                  <p style={{ margin: '2px 0 0', fontWeight: '600', fontSize: '0.9rem' }}>
                    #{order.id.slice(-8).toUpperCase()}
                  </p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>DATE</p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.9rem' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>TOTAL</p>
                  <p style={{ margin: '2px 0 0', fontWeight: 'bold', color: '#16a34a' }}>
                    ₹{order.total}
                  </p>
                </div>
                <span style={{
                  padding: '6px 14px', borderRadius: '999px',
                  fontSize: '0.8rem', fontWeight: '600',
                  background: colors.bg, color: colors.color,
                  textTransform: 'capitalize'
                }}>
                  {status}
                </span>
              </div>

              {/* Order Products */}
              <div style={{ padding: '16px 20px' }}>
                <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#888', fontWeight: '600' }}>
                  ITEMS
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {order.products?.map((product: any) => (
                    <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '56px', height: '56px', background: '#f9f9f9',
                        borderRadius: '8px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', flexShrink: 0
                      }}>
                        {product.image?.url ? (
                          <img
                            src={`http://localhost:3000${product.image.url}`}
                            alt={product.name}
                            style={{ width: '56px', height: '56px', objectFit: 'contain', borderRadius: '8px' }}
                          />
                        ) : (
                          <span style={{ fontSize: '1.5rem' }}>📦</span>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: '500', fontSize: '0.95rem' }}>{product.name}</p>
                        <p style={{ margin: '2px 0 0', color: '#16a34a', fontWeight: 'bold', fontSize: '0.9rem' }}>
                          ₹{product.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Notes */}
                {order.notes && (
                  <p style={{ margin: '12px 0 0', fontSize: '0.85rem', color: '#888' }}>
                    📝 {order.notes}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
