const API_URL = typeof window !== "undefined"
  ? "/api"
  : `${process.env.NEXT_PUBLIC_SERVER_URL}/api`

export async function getProducts() {
  const res = await fetch(`${API_URL}/products?depth=1&limit=100`, { cache: 'no-store' })
  const data = await res.json()
  return data.docs || []
}

export async function getProduct(id: string) {
  const res = await fetch(`${API_URL}/products/${id}?depth=2`, { cache: 'no-store' })
  return res.json()
}

// ✅ Fixed — no featured endpoint exists, use inStock filter instead
export async function getFeaturedProducts() {
  const res = await fetch(`${API_URL}/products?where[inStock][equals]=true&depth=1&limit=8`, { cache: 'no-store' })
  const data = await res.json()
  return data.docs || []
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
