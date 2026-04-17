import Link from 'next/link'

export default function NotFound() {
  return (
    <main style={{ maxWidth: '560px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
      <p style={{ fontSize: '4rem', marginBottom: '16px' }}>404</p>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '12px' }}>Page not found</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link href="/" style={{
        background: '#000', color: '#fff', padding: '12px 24px',
        borderRadius: '8px', textDecoration: 'none', fontWeight: '600'
      }}>
        Go Home
      </Link>
    </main>
  )
}
