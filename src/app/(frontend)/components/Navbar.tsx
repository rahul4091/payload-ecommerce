'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const { totalItems } = useCart()

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    router.push('/')
  }

  return (
    <nav style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '16px 40px', borderBottom: '1px solid #eee', background: '#fff'
    }}>
      <Link href="/" style={{ fontWeight: 'bold', fontSize: '1.2rem', textDecoration: 'none', color: '#000' }}>
        🛍️ My Store
      </Link>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <Link href="/products" style={{ textDecoration: 'none', color: '#333' }}>Products</Link>

        {/* 👇 Cart icon with count */}
        <Link href="/cart" style={{ textDecoration: 'none', color: '#333', position: 'relative' }}>
          🛒
          {totalItems > 0 && (
            <span style={{
              position: 'absolute', top: '-8px', right: '-8px',
              background: '#000', color: '#fff', borderRadius: '999px',
              fontSize: '0.7rem', padding: '1px 6px', fontWeight: 'bold'
            }}>
              {totalItems}
            </span>
          )}
        </Link>

       {user ? (
  <>
    <Link href="/orders" style={{ textDecoration: 'none', color: '#333', fontSize: '0.9rem' }}>
      My Orders
    </Link>
    <span style={{ color: '#666', fontSize: '0.9rem' }}>👤 {user.email}</span>
    <button onClick={handleLogout} style={{
      background: '#000', color: '#fff', border: 'none',
      padding: '8px 16px', borderRadius: '8px', cursor: 'pointer'
    }}>
      Logout
    </button>
  </>
) : (
          <Link href="/login" style={{
            background: '#000', color: '#fff',
            padding: '8px 16px', borderRadius: '8px', textDecoration: 'none'
          }}>
            Login
          </Link>
        )}
      </div>
    </nav>
  )
}
