'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async () => {
    setError('')

    // Validate
    if (!name || !email || !password || !confirm) {
      setError('All fields are required')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      // Step 1 — Create user account
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000"}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role: 'customer',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data?.errors?.[0]?.message || 'Registration failed')
        setLoading(false)
        return
      }

      // Step 2 — Auto login after registration
      const loginRes = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000"}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const loginData = await loginRes.json()

      if (loginData.token) {
        localStorage.setItem('token', loginData.token)
        localStorage.setItem('user', JSON.stringify(loginData.user))

        // Step 3 — Create customer record
        await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000"}/api/customers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `JWT ${loginData.token}`,
          },
          body: JSON.stringify({
            name,
            email,
            phone: '',
          }),
        })

        router.push('/products')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f9' }}>
      <div style={{ background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: '100%', maxWidth: '420px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '8px' }}>Create Account 🎉</h1>
        <p style={{ color: '#666', marginBottom: '32px' }}>Join My Store today</p>

        {error && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '0.9rem' }}>Full Name</label>
          <input
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '0.9rem' }}>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '0.9rem' }}>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '0.9rem' }}>Confirm Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleRegister()}
            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <button
          onClick={handleRegister}
          disabled={loading}
          style={{
            width: '100%', padding: '14px',
            background: loading ? '#666' : '#000',
            color: '#fff', border: 'none',
            borderRadius: '8px', fontSize: '1rem',
            fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Creating Account...' : 'Create Account →'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#666', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#000', fontWeight: '600', textDecoration: 'none' }}>
            Login
          </Link>
        </p>
      </div>
    </main>
  )
}
