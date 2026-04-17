'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [wishlistCount, setWishlistCount] = useState(0)
  const router = useRouter()
  const { totalItems } = useCart()

  const loadWishlistCount = () => {
    const ids: string[] = JSON.parse(localStorage.getItem('wishlist') || '[]')
    setWishlistCount(ids.length)
  }

  const loadUser = () => {
    const stored = localStorage.getItem('user')
    setUser(stored ? JSON.parse(stored) : null)
  }

  useEffect(() => {
    loadUser()
    loadWishlistCount()
    window.addEventListener('auth-change', loadUser)
    window.addEventListener('wishlist-change', loadWishlistCount)
    return () => {
      window.removeEventListener('auth-change', loadUser)
      window.removeEventListener('wishlist-change', loadWishlistCount)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    window.dispatchEvent(new Event('auth-change'))
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
      flexWrap: 'wrap', gap: '12px', position: 'sticky', top: 0, zIndex: 100,
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

        {/* Wishlist */}
        <Link href="/wishlist" style={{ textDecoration: 'none', color: '#333', position: 'relative' }}>
          🤍
          {wishlistCount > 0 && (
            <span style={{
              position: 'absolute', top: '-8px', right: '-8px',
              background: '#dc2626', color: '#fff', borderRadius: '999px',
              fontSize: '0.7rem', padding: '1px 6px', fontWeight: 'bold'
            }}>
              {wishlistCount}
            </span>
          )}
        </Link>

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
            {user.role === 'admin' && (
              <Link href="/dashboard" style={{ textDecoration: 'none', color: '#333', fontSize: '0.9rem' }}>
                Dashboard
              </Link>
            )}
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
