'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Stats {
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  processingOrders: number
  shippedOrders: number
  deliveredOrders: number
  cancelledOrders: number
  recentOrders: any[]
  topProducts: any[]
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending_payment: { bg: '#fef9c3', color: '#a16207' },
  pending: { bg: '#fef9c3', color: '#a16207' },
  processing: { bg: '#dbeafe', color: '#1d4ed8' },
  shipped: { bg: '#e0f2fe', color: '#0369a1' },
  delivered: { bg: '#dcfce7', color: '#16a34a' },
  cancelled: { bg: '#fee2e2', color: '#dc2626' },
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const token = localStorage.getItem('token')
    if (!token || user?.role !== 'admin') {
      router.replace('/')
      return
    }
    fetchStats(token)
  }, [])

  const fetchStats = async (token: string) => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        fetch('/api/orders?limit=100&depth=1&sort=-createdAt', { headers: { Authorization: `JWT ${token}` } }),
        fetch('/api/products?limit=100&depth=0', { headers: { Authorization: `JWT ${token}` } }),
      ])

      const ordersData = await ordersRes.json()
      const productsData = await productsRes.json()
      const orders: any[] = ordersData.docs || []

      const totalRevenue = orders
        .filter((o: any) => o.status !== 'cancelled')
        .reduce((sum: number, o: any) => sum + (o.total || 0), 0)

      const countByStatus = (s: string) => orders.filter((o: any) => o.status === s).length

      // Top products by order count
      const productCount: Record<string, { name: string; count: number; price: number }> = {}
      orders.forEach((o: any) => {
        ;(o.products || []).forEach((p: any) => {
          const id = typeof p === 'string' ? p : p.id
          const name = typeof p === 'object' ? p.name : id
          const price = typeof p === 'object' ? p.price : 0
          if (!productCount[id]) productCount[id] = { name, count: 0, price }
          productCount[id].count++
        })
      })

      const topProducts = Object.entries(productCount)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5)
        .map(([id, val]) => ({ id, ...val }))

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders: countByStatus('pending') + countByStatus('pending_payment'),
        processingOrders: countByStatus('processing'),
        shippedOrders: countByStatus('shipped'),
        deliveredOrders: countByStatus('delivered'),
        cancelledOrders: countByStatus('cancelled'),
        recentOrders: orders.slice(0, 10),
        topProducts,
      })
    } catch (e) {
      setError('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ label, value, sub, color = '#000' }: { label: string; value: string | number; sub?: string; color?: string }) => (
    <div style={{ border: '1px solid #eee', borderRadius: '12px', padding: '20px 24px', background: '#fff' }}>
      <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#888', fontWeight: '500' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold', color }}>{value}</p>
      {sub && <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#aaa' }}>{sub}</p>}
    </div>
  )

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>Analytics Dashboard</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/admin" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem', border: '1px solid #ddd', padding: '8px 16px', borderRadius: '8px' }}>
            Payload Admin →
          </Link>
          <Link href="/" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>← Home</Link>
        </div>
      </div>

      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ border: '1px solid #eee', borderRadius: '12px', padding: '20px', height: '100px', background: '#f9f9f9', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
        </div>
      )}

      {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '16px', borderRadius: '10px' }}>{error}</div>}

      {stats && !loading && (
        <>
          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '40px' }}>
            <StatCard label="Total Orders" value={stats.totalOrders} />
            <StatCard label="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} color="#16a34a" />
            <StatCard label="Pending" value={stats.pendingOrders} color="#a16207" />
            <StatCard label="Processing" value={stats.processingOrders} color="#1d4ed8" />
            <StatCard label="Shipped" value={stats.shippedOrders} color="#0369a1" />
            <StatCard label="Delivered" value={stats.deliveredOrders} color="#16a34a" />
            <StatCard label="Cancelled" value={stats.cancelledOrders} color="#dc2626" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
            {/* Recent Orders */}
            <div style={{ border: '1px solid #eee', borderRadius: '12px', padding: '24px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 20px' }}>Recent Orders</h2>
              {stats.recentOrders.length === 0 ? (
                <p style={{ color: '#aaa', textAlign: 'center', padding: '20px 0' }}>No orders yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {stats.recentOrders.map((o: any) => {
                    const sc = STATUS_COLORS[o.status] || { bg: '#f3f4f6', color: '#555' }
                    return (
                      <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f3f3f3' }}>
                        <div>
                          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '500' }}>#{o.id.slice(-6).toUpperCase()}</p>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: '#999' }}>{o.customer?.email || '—'}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ margin: '0 0 4px', fontSize: '0.9rem', fontWeight: '600' }}>₹{o.total}</p>
                          <span style={{ fontSize: '0.72rem', fontWeight: '600', padding: '2px 8px', borderRadius: '999px', background: sc.bg, color: sc.color }}>
                            {o.status}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Top Products */}
            <div style={{ border: '1px solid #eee', borderRadius: '12px', padding: '24px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 20px' }}>Top Products</h2>
              {stats.topProducts.length === 0 ? (
                <p style={{ color: '#aaa', textAlign: 'center', padding: '20px 0' }}>No data yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {stats.topProducts.map((p, i) => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ width: '24px', height: '24px', background: '#f3f3f3', borderRadius: '999px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700', flexShrink: 0 }}>
                        {i + 1}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                      </div>
                      <span style={{ fontSize: '0.85rem', color: '#888', flexShrink: 0 }}>{p.count} orders</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </main>
  )
}
