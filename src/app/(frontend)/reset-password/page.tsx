'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function ResetPasswordForm() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (!token) {
      setError('Invalid or expired reset link. Please request a new one.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/customers/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      if (res.ok) {
        router.push('/login?reset=success')
      } else {
        const data = await res.json()
        setError(data?.errors?.[0]?.message || 'Reset failed. The link may have expired.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <main style={{ maxWidth: '440px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: '2rem', marginBottom: '16px' }}>⚠️</p>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Invalid Reset Link</h1>
        <p style={{ color: '#666', marginBottom: '24px' }}>This link is missing a token. Please request a new reset link.</p>
        <Link href="/forgot-password" style={{ background: '#000', color: '#fff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
          Request New Link
        </Link>
      </main>
    )
  }

  return (
    <main style={{ maxWidth: '440px', margin: '0 auto', padding: '80px 24px' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '8px' }}>Reset Password</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>Enter your new password below.</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '0.9rem' }}>
            New Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
            minLength={6}
            style={{
              width: '100%', padding: '11px 14px', border: '1px solid #ddd',
              borderRadius: '8px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '0.9rem' }}>
            Confirm New Password
          </label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Repeat your password"
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
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main style={{ padding: '80px', textAlign: 'center' }}><p>Loading...</p></main>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
