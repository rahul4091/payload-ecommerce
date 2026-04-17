'use client'

import { useState, useEffect } from 'react'

interface Review {
  id: string
  title: string
  rating: number
  comment: string
  user: any
  createdAt: string
}

export default function ProductReviews({ productId, initialReviews = [] }: { productId: string; initialReviews?: Review[] }) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [authError, setAuthError] = useState(false)
  const [form, setForm] = useState({
    title: '',
    rating: 5,
    comment: '',
  })

  const fetchReviews = () => {
    fetch(`/api/reviews?where[product][equals]=${productId}&depth=1&limit=20`)
      .then(r => r.json())
      .then(data => {
        setReviews(data.docs || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    if (initialReviews.length === 0) fetchReviews()
  }, [productId])

  const handleSubmit = async () => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')

    if (!token || !user) {
      setAuthError(true)
      return
    }
    setAuthError(false)

    const parsedUser = JSON.parse(user)
    setSubmitting(true)

    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `JWT ${token}`,
      },
      body: JSON.stringify({
        product: productId,
        user: parsedUser.id,
        title: form.title,
        rating: form.rating,
        comment: form.comment,
      }),
    })

    if (res.ok) {
      setSuccess(true)
      setShowForm(false)
      setForm({ title: '', rating: 5, comment: '' })
      fetchReviews()
    }
    setSubmitting(false)
  }

  // Calculate average rating
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const renderStars = (rating: number, size = '1rem') =>
    [1, 2, 3, 4, 5].map(star => (
      <span key={star} style={{ fontSize: size, color: star <= rating ? '#f59e0b' : '#ddd' }}>★</span>
    ))

  const renderRatingDistribution = () => {
    return [5, 4, 3, 2, 1].map(star => {
      const count = reviews.filter(r => r.rating === star).length
      const percent = reviews.length ? (count / reviews.length) * 100 : 0
      return (
        <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.8rem', minWidth: '16px' }}>{star}</span>
          <span style={{ fontSize: '0.85rem', color: '#f59e0b' }}>★</span>
          <div style={{ flex: 1, background: '#f3f3f3', borderRadius: '999px', height: '8px' }}>
            <div style={{ width: `${percent}%`, background: '#f59e0b', borderRadius: '999px', height: '8px' }} />
          </div>
          <span style={{ fontSize: '0.8rem', color: '#888', minWidth: '20px' }}>{count}</span>
        </div>
      )
    })
  }

  return (
    <div style={{ marginTop: '48px', borderTop: '1px solid #eee', paddingTop: '32px' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px' }}>
        Reviews & Ratings
      </h2>

      {/* Rating Summary */}
      {reviews.length > 0 && (
        <div style={{ display: 'flex', gap: '32px', marginBottom: '32px', padding: '24px', background: '#f9f9f9', borderRadius: '12px' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '3.5rem', fontWeight: 'bold', margin: 0, lineHeight: 1 }}>{avgRating}</p>
            <div style={{ margin: '8px 0 4px' }}>{renderStars(Math.round(Number(avgRating)), '1.2rem')}</div>
            <p style={{ color: '#888', fontSize: '0.85rem', margin: 0 }}>{reviews.length} reviews</p>
          </div>
          <div style={{ flex: 1 }}>
            {renderRatingDistribution()}
          </div>
        </div>
      )}

      {/* Write Review Button */}
      {authError && (
        <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>
          Please{' '}
          <a href="/login" style={{ color: '#dc2626', fontWeight: '600' }}>login</a>
          {' '}to submit a review.
        </div>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '10px 20px', background: '#000', color: '#fff',
            border: 'none', borderRadius: '8px', cursor: 'pointer',
            fontWeight: '600', marginBottom: '24px'
          }}
        >
          ✍️ Write a Review
        </button>
      )}

      {success && (
        <div style={{ background: '#dcfce7', color: '#16a34a', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
          ✅ Review submitted successfully!
        </div>
      )}

      {/* Review Form */}
      {showForm && (
        <div style={{ border: '1px solid #eee', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem' }}>Write Your Review</h3>

          {/* Star Rating */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>Rating</label>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setForm(prev => ({ ...prev, rating: star }))}
                  style={{
                    fontSize: '2rem', background: 'none', border: 'none',
                    cursor: 'pointer', color: star <= form.rating ? '#f59e0b' : '#ddd',
                    padding: '0 2px'
                  }}
                >★</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '0.9rem' }}>Review Title</label>
            <input
              value={form.title}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Great product!"
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '0.9rem' }}>Your Review</label>
            <textarea
              value={form.comment}
              onChange={e => setForm(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Share your experience with this product..."
              rows={4}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleSubmit}
              disabled={submitting || !form.title || !form.comment}
              style={{
                padding: '10px 24px', background: submitting ? '#666' : '#000',
                color: '#fff', border: 'none', borderRadius: '8px',
                cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: '600'
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              style={{
                padding: '10px 24px', background: '#fff', color: '#333',
                border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <p style={{ color: '#666' }}>Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
          <p style={{ fontSize: '2rem' }}>⭐</p>
          <p>No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reviews.map(review => (
            <div key={review.id} style={{
              border: '1px solid #eee', borderRadius: '12px', padding: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      {review.user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: '600', fontSize: '0.9rem' }}>{review.user?.name || review.user?.email || 'Anonymous'}</p>
                      <div>{renderStars(review.rating, '0.9rem')}</div>
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#888' }}>
                  {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <h4 style={{ margin: '12px 0 6px', fontSize: '1rem' }}>{review.title}</h4>
              <p style={{ margin: 0, color: '#555', lineHeight: '1.6', fontSize: '0.95rem' }}>{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
