'use client'

import { useState } from 'react'
import { login } from '@/lib/api'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    setLoading(true)
    setError('')

    const data = await login(email, password)

    if (data.token) {
      // Save token and user to localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      router.push('/products') // redirect after login
    } else {
      setError('Invalid email or password')
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f9' }}>
      <div style={{ background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '8px' }}>Welcome back 👋</h1>
        <p style={{ color: '#666', marginBottom: '32px' }}>Login to your account</p>

        {error && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

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

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '0.9rem' }}>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%', padding: '14px',
            background: loading ? '#666' : '#000',
            color: '#fff', border: 'none',
            borderRadius: '8px', fontSize: '1rem',
            fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Logging in...' : 'Login →'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#666', fontSize: '0.9rem' }}>
          <a href="/" style={{ color: '#000', textDecoration: 'none', fontWeight: '500' }}>← Back to Home</a>
        </p>
      </div>
    </main>
  )
}
