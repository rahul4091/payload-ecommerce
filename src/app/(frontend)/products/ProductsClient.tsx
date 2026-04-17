'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getImageUrl } from '@/lib/constants'

interface ProductsClientProps {
  initialProducts: any[]
  initialTotalPages: number
  categories: any[]
}

const SORT_OPTIONS = [
  { label: 'Newest', value: '-createdAt' },
  { label: 'Price: Low to High', value: 'price' },
  { label: 'Price: High to Low', value: '-price' },
  { label: 'Name A–Z', value: 'name' },
]

export default function ProductsClient({ initialProducts, initialTotalPages, categories }: ProductsClientProps) {
  const [products, setProducts] = useState(initialProducts)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('-createdAt')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(initialTotalPages)

  const fetchProducts = async (opts: { categoryId?: string; nextPage?: number; sortBy?: string; min?: string; max?: string }) => {
    const { categoryId = category, nextPage = 1, sortBy = sort, min = minPrice, max = maxPrice } = opts
    setLoading(true)
    let url = `/api/products?depth=1&limit=12&page=${nextPage}&sort=${sortBy}`
    if (categoryId) url += `&where[category][equals]=${categoryId}`
    if (min) url += `&where[price][greater_than_equal]=${min}`
    if (max) url += `&where[price][less_than_equal]=${max}`
    try {
      const res = await fetch(url)
      const data = await res.json()
      setProducts(data.docs || [])
      setTotalPages(data.totalPages || 1)
      setPage(data.page || 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (categoryId: string) => {
    setCategory(categoryId)
    setSearch('')
    fetchProducts({ categoryId, nextPage: 1 })
  }

  const handleSortChange = (sortBy: string) => {
    setSort(sortBy)
    fetchProducts({ sortBy, nextPage: 1 })
  }

  const handlePriceFilter = () => {
    setSearch('')
    fetchProducts({ nextPage: 1, min: minPrice, max: maxPrice })
  }

  const handleClearFilters = () => {
    setCategory('')
    setSort('-createdAt')
    setMinPrice('')
    setMaxPrice('')
    setSearch('')
    fetchProducts({ categoryId: '', nextPage: 1, sortBy: '-createdAt', min: '', max: '' })
  }

  const handlePageChange = (nextPage: number) => {
    fetchProducts({ nextPage })
  }

  const filtered = search
    ? products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))
    : products

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>All Products</h1>
        <Link href="/" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to Home</Link>
      </div>

      {/* Search + Sort */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="🔍 Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: '200px', padding: '10px 16px',
            border: '1px solid #ddd', borderRadius: '8px',
            fontSize: '0.95rem', outline: 'none'
          }}
        />
        <select
          value={category}
          onChange={e => handleCategoryChange(e.target.value)}
          style={{
            padding: '10px 16px', border: '1px solid #ddd',
            borderRadius: '8px', fontSize: '0.95rem',
            background: '#fff', cursor: 'pointer', outline: 'none'
          }}
        >
          <option value="">All Categories</option>
          {categories.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={e => handleSortChange(e.target.value)}
          style={{
            padding: '10px 16px', border: '1px solid #ddd',
            borderRadius: '8px', fontSize: '0.95rem',
            background: '#fff', cursor: 'pointer', outline: 'none'
          }}
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Price Filter */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '32px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.9rem', color: '#555', fontWeight: '500' }}>Price:</span>
        <input
          type="number"
          placeholder="Min ₹"
          value={minPrice}
          onChange={e => setMinPrice(e.target.value)}
          style={{ width: '100px', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
        />
        <span style={{ color: '#999' }}>–</span>
        <input
          type="number"
          placeholder="Max ₹"
          value={maxPrice}
          onChange={e => setMaxPrice(e.target.value)}
          style={{ width: '100px', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
        />
        <button
          onClick={handlePriceFilter}
          style={{ padding: '8px 16px', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}
        >
          Apply
        </button>
        {(minPrice || maxPrice || category || sort !== '-createdAt') && (
          <button
            onClick={handleClearFilters}
            style={{ padding: '8px 16px', background: '#f5f5f5', color: '#555', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {loading && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{ border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ height: '200px', background: '#f0f0f0', animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ height: '12px', width: '60px', background: '#f0f0f0', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  <div style={{ height: '16px', width: '80%', background: '#f0f0f0', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  <div style={{ height: '16px', width: '40%', background: '#f0f0f0', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                </div>
              </div>
            ))}
          </div>
          <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <p style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</p>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>No products found</p>
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ marginTop: '12px', padding: '8px 20px', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <>
          <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '20px' }}>
            {search ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${search}"` : `Page ${page} of ${totalPages}`}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
            {filtered.map((product: any) => (
              <Link key={product.id} href={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div
                  style={{
                    border: '1px solid #eee', borderRadius: '12px',
                    overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'
                    ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
                    ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'
                  }}
                >
                  <div style={{ background: '#f9f9f9', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {product.image?.url ? (
                      <img
                        src={getImageUrl(product.image.url)}
                        alt={product.image.alt || product.name}
                        style={{ width: '100%', height: '200px', objectFit: 'contain' }}
                      />
                    ) : (
                      <span style={{ fontSize: '3rem' }}>📦</span>
                    )}
                  </div>
                  <div style={{ padding: '16px' }}>
                    {product.category?.name && (
                      <span style={{ fontSize: '0.75rem', color: '#888', background: '#f3f3f3', padding: '2px 10px', borderRadius: '999px' }}>
                        {product.category.name}
                      </span>
                    )}
                    <h3 style={{ fontWeight: '600', margin: '8px 0 4px', fontSize: '1rem' }}>{product.name}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ color: '#16a34a', fontWeight: 'bold', margin: 0 }}>₹{product.price}</p>
                      <span style={{
                        fontSize: '0.75rem', fontWeight: '600',
                        padding: '2px 10px', borderRadius: '999px',
                        background: product.inStock ? '#dcfce7' : '#fee2e2',
                        color: product.inStock ? '#16a34a' : '#dc2626'
                      }}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination — only show when not searching */}
          {!search && totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '48px' }}>
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                style={{
                  padding: '8px 16px', border: '1px solid #ddd', borderRadius: '8px',
                  background: page <= 1 ? '#f5f5f5' : '#fff', cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  color: page <= 1 ? '#bbb' : '#000', fontWeight: '500'
                }}
              >
                ← Prev
              </button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const p = i + 1
                const isNear = Math.abs(p - page) <= 2 || p === 1 || p === totalPages
                if (!isNear) {
                  if (p === 2 || p === totalPages - 1) return <span key={p} style={{ color: '#bbb' }}>…</span>
                  return null
                }
                return (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    style={{
                      width: '36px', height: '36px', border: '1px solid',
                      borderColor: p === page ? '#000' : '#ddd',
                      borderRadius: '8px',
                      background: p === page ? '#000' : '#fff',
                      color: p === page ? '#fff' : '#000',
                      fontWeight: p === page ? '700' : '400',
                      cursor: 'pointer'
                    }}
                  >
                    {p}
                  </button>
                )
              })}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                style={{
                  padding: '8px 16px', border: '1px solid #ddd', borderRadius: '8px',
                  background: page >= totalPages ? '#f5f5f5' : '#fff', cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                  color: page >= totalPages ? '#bbb' : '#000', fontWeight: '500'
                }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </main>
  )
}
