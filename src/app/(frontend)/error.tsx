'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main style={{ maxWidth: '560px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
      <p style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</p>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '12px' }}>Something went wrong</h1>
      <p style={{ color: '#666', marginBottom: '32px', lineHeight: '1.6' }}>
        An unexpected error occurred. Please try again or go back to the home page.
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button
          onClick={reset}
          style={{
            background: '#000', color: '#fff', padding: '12px 24px',
            borderRadius: '8px', border: 'none', fontWeight: '600',
            fontSize: '1rem', cursor: 'pointer'
          }}
        >
          Try Again
        </button>
        <Link href="/" style={{
          border: '1px solid #000', color: '#000', padding: '12px 24px',
          borderRadius: '8px', textDecoration: 'none', fontWeight: '600'
        }}>
          Go Home
        </Link>
      </div>
    </main>
  )
}
