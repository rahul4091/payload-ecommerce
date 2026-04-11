import Link from 'next/link'
import { getProducts } from '@/lib/api'

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <Link href="/" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to Home</Link>
          <h1 style={{ fontSize: '2rem', margin: '8px 0 0' }}>All Products</h1>
        </div>
        <span style={{ color: '#666', fontSize: '0.9rem' }}>{products.length} products</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {products.map((product: any) => (
          <Link key={product.id} href={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer' }}>
              <div style={{ background: '#f9f9f9', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {product.image?.url ? (
                  <img
                    src={`http://localhost:3000${product.image.url}`}
                    alt={product.image.alt || product.name}
                    style={{ width: '100%', height: '220px', objectFit: 'contain' }}
                  />
                ) : (
                  <span style={{ fontSize: '3rem' }}>📦</span>
                )}
              </div>
              <div style={{ padding: '16px' }}>
                {product.category && (
                  <span style={{ fontSize: '0.75rem', color: '#888', background: '#f3f3f3', padding: '2px 8px', borderRadius: '999px', marginBottom: '8px', display: 'inline-block' }}>
                    {product.category.name}
                  </span>
                )}
                <h2 style={{ fontSize: '1rem', fontWeight: '600', margin: '8px 0' }}>{product.name}</h2>
                <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 12px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
                  {product.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#16a34a' }}>₹{product.price}</span>
                  <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '999px', background: product.inStock ? '#dcfce7' : '#fee2e2', color: product.inStock ? '#16a34a' : '#dc2626' }}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
