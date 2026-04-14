const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://payload-ecommerce-eight.vercel.app'

const API_URL = typeof window !== "undefined"
  ? "/api"
  : `${SERVER_URL}/api`

// Debug — remove after fixing
if (typeof window === "undefined") {
  console.log('[api.ts] SERVER_URL:', SERVER_URL)
  console.log('[api.ts] API_URL:', API_URL)
}

export async function getProducts() {
  try {
    const res = await fetch(`${API_URL}/products?depth=1&limit=100`, { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json()
    return data.docs || []
  } catch (err) {
    console.error('getProducts failed:', err)
    return []  // return empty array instead of crashing
  }
}

export async function getProduct(id: string) {
  try {
    const res = await fetch(`${API_URL}/products/${id}?depth=2`, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch (err) {
    console.error('getProduct failed:', err)
    return null
  }
}

export async function getFeaturedProducts() {
  try {
    const res = await fetch(`${API_URL}/products?where[inStock][equals]=true&depth=1&limit=8`, { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json()
    return data.docs || []
  } catch (err) {
    console.error('getFeaturedProducts failed:', err)
    return []
  }
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return res.json()
}

export async function createOrder(orderData: any, token: string) {
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `JWT ${token}`,
    },
    body: JSON.stringify(orderData),
  })
  return res.json()
}

export async function getMyOrders(token: string) {
  const res = await fetch(`${API_URL}/orders?depth=2`, {
    headers: { Authorization: `JWT ${token}` },
    cache: 'no-store',
  })
  return res.json()
}

// ✅ This works — your Products collection has a /search endpoint
export async function searchProducts(query: string) {
  const res = await fetch(
    `${API_URL}/products/search?q=${encodeURIComponent(query)}`,
    { cache: 'no-store' }
  )
  const data = await res.json()
  return data.results || []
}
