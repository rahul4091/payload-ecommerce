import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getImageUrl } from '@/lib/constants'
import { getProduct, getProductReviews } from '@/lib/api'
import ProductActions from '../../components/ProductActions'
import ProductReviews from '../../components/ProductReviews'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) return { title: 'Product Not Found' }
  const imageUrl = product.image?.url ? getImageUrl(product.image.url) : undefined
  return {
    title: product.name,
    description: product.description || `Buy ${product.name} for ₹${product.price}`,
    openGraph: {
      title: product.name,
      description: product.description || `Buy ${product.name} for ₹${product.price}`,
      images: imageUrl ? [{ url: imageUrl, alt: product.name }] : [],
    },
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [product, reviews] = await Promise.all([getProduct(id), getProductReviews(id)])
  if (!product || product?.errors || product?.error) notFound()

  return (
    <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
      <Link href="/products" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>
        ← Back to Products
      </Link>

      <div className="product-detail-grid">

        {/* Image */}
        <div style={{
          background: '#f9f9f9', borderRadius: '16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px',
        }}>
          {product.image?.url ? (
            <img
              src={getImageUrl(product.image.url)}
              alt={product.image.alt || product.name}
              style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '16px' }}
            />
          ) : (
            <span style={{ fontSize: '5rem' }}>📦</span>
          )}
        </div>

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {product.category?.name && (
            <span style={{
              fontSize: '0.8rem', color: '#888', background: '#f3f3f3',
              padding: '4px 12px', borderRadius: '999px',
              display: 'inline-block', marginBottom: '16px', width: 'fit-content',
            }}>
              📁 {product.category.name}
            </span>
          )}

          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0 0 8px' }}>{product.name}</h1>

          {product.description && (
            <p style={{ color: '#555', lineHeight: '1.7', marginBottom: '20px', whiteSpace: 'pre-line' }}>
              {product.description}
            </p>
          )}

          <ProductActions product={product} />
        </div>
      </div>

      <ProductReviews productId={id} initialReviews={reviews} />
    </main>
  )
}
