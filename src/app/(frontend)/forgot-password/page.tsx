'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/customers/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setSent(true)
      } else {
        const data = await res.json()
        setError(data?.errors?.[0]?.message || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <main style={{ maxWidth: '440px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: '3rem', marginBottom: '16px' }}>📧</p>
        <h1 style={{ fontSize: '1.6rem', marginBottom: '12px' }}>Check your email</h1>
        <p style={{ color: '#666', marginBottom: '32px', lineHeight: '1.6' }}>
          If an account exists for <strong>{email}</strong>, we've sent a password reset link.
        </p>
        <Link href="/login" style={{
          background: '#000', color: '#fff', padding: '12px 24px',
          borderRadius: '8px', textDecoration: 'none', fontWeight: '600'
        }}>
          Back to Login
        </Link>
      </main>
    )
  }

  return (
    <main style={{ maxWidth: '440px', margin: '0 auto', padding: '80px 24px' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '8px' }}>Forgot Password</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Enter your email and we'll send you a reset link.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '0.9rem' }}>
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={{
              width: '100%', padding: '11px 14px', border: '1px solid #ddd',
              borderRadius: '8px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        {error && (
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px', borderRadius: '8px', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px', background: loading ? '#666' : '#000',
            color: '#fff', border: 'none', borderRadius: '8px',
            fontSize: '1rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
          Remember your password?{' '}
          <Link href="/login" style={{ color: '#000', fontWeight: '600' }}>Login</Link>
        </p>
      </form>
    </main>
  )
}
