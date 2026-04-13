'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [search, setSearch] = useState('')
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`)
      setSearch('')
    }
  }

  return (
    <nav style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '16px 40px', borderBottom: '1px solid #eee', background: '#fff',
      flexWrap: 'wrap', gap: '12px'
    }}>
      {/* Logo */}
      <Link href="/" style={{ fontWeight: 'bold', fontSize: '1.2rem', textDecoration: 'none', color: '#000' }}>
        🛍️ My Store
      </Link>

      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', flex: 1, maxWidth: '400px' }}>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, padding: '8px 16px', border: '1px solid #ddd',
            borderRadius: '999px', fontSize: '0.9rem', outline: 'none'
          }}
        />
        <button type="submit" style={{
          background: '#000', color: '#fff', border: 'none',
          padding: '8px 16px', borderRadius: '999px', cursor: 'pointer',
          fontSize: '0.9rem'
        }}>
          🔍
        </button>
      </form>

      {/* Nav Links */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <Link href="/products" style={{ textDecoration: 'none', color: '#333' }}>Products</Link>

        {/* Cart */}
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
  <div style={{ display: 'flex', gap: '8px' }}>
    <Link href="/register" style={{
      border: '1px solid #000',
      padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', color: '#000'
    }}>
      Sign Up
    </Link>
    <Link href="/login" style={{
      background: '#000', color: '#fff',
      padding: '8px 16px', borderRadius: '8px', textDecoration: 'none'
    }}>
      Login
    </Link>
  </div>
)}
      </div>
    </nav>
  )
}
