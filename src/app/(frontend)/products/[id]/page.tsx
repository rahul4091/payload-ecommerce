import Link from 'next/link'
import { getProduct, getProducts } from '@/lib/api'
import AddToCartButton from '../../components/AddToCartButton'

// Generate static params for all products
export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((product: any) => ({ id: product.id }))
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params  // 👈 await params first
  const product = await getProduct(id)

  if (!product || product.errors) {
    return (
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem' }}>Product not found 😕</h1>
        <a href="/products" style={{ color: '#000', textDecoration: 'none', fontWeight: '600' }}>
          ← Back to Products
        </a>
      </main>
    )
  }


  return (
    <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Back Link */}
      <Link href="/products" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>
        ← Back to Products
      </Link>

      {/* Product Detail */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginTop: '24px' }}>

        {/* Left — Image */}
        <div style={{ background: '#f9f9f9', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
          {product.image?.url ? (
            <img
              src={`http://localhost:3000${product.image.url}`}
              alt={product.image.alt || product.name}
              style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '16px' }}
            />
          ) : (
            <span style={{ fontSize: '5rem' }}>📦</span>
          )}
        </div>

        {/* Right — Info */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Category */}
          {product.category && (
            <span style={{ fontSize: '0.8rem', color: '#888', background: '#f3f3f3', padding: '4px 12px', borderRadius: '999px', display: 'inline-block', marginBottom: '16px', width: 'fit-content' }}>
              📁 {product.category.name}
            </span>
          )}

          {/* Name */}
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0 0 16px' }}>
            {product.name}
          </h1>

          {/* Price */}
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#16a34a', margin: '0 0 16px' }}>
            ₹{product.price}
          </p>

          {/* Stock Status */}
          <div style={{ marginBottom: '24px' }}>
            <span style={{
              padding: '6px 14px', borderRadius: '999px', fontSize: '0.85rem', fontWeight: '600',
              background: product.inStock ? '#dcfce7' : '#fee2e2',
              color: product.inStock ? '#16a34a' : '#dc2626'
            }}>
              {product.inStock ? '✅ In Stock' : '❌ Out of Stock'}
            </span>
          </div>

          {/* Description */}
          <p style={{ color: '#555', lineHeight: '1.7', marginBottom: '32px', whiteSpace: 'pre-line' }}>
            {product.description}
          </p>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <AddToCartButton product={product} />
            <button style={{
              padding: '14px 20px', background: '#fff', color: '#000',
              border: '1px solid #000', borderRadius: '10px', fontSize: '1rem',
              cursor: 'pointer'
            }}>
              ♡
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
