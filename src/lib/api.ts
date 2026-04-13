const API_URL = 'http://localhost:3000/api'

export async function getProducts() {
  const res = await fetch(`${API_URL}/products?depth=1&limit=100`, { cache: 'no-store' })
  const data = await res.json()
  return data.docs
}

export async function getProduct(id: string) {
  const res = await fetch(`${API_URL}/products/${id}?depth=2`, { cache: 'no-store' })
  const data = await res.json()
  return data  // 👈 return full response
}

export async function getFeaturedProducts() {
  const res = await fetch(`${API_URL}/products/featured`, { cache: 'no-store' })
  const data = await res.json()
  return data.products
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
      'Authorization': `JWT ${token}`,
    },
    body: JSON.stringify(orderData),
  })
  return res.json()
}


export async function getMyOrders(token: string) {
  const res = await fetch(`${API_URL}/orders?depth=2`, {
    headers: {
      Authorization: `JWT ${token}`,
    },
    cache: 'no-store',
  })
  return res.json()
}


export async function searchProducts(query: string) {
  const res = await fetch(
    `${API_URL}/products/search?q=${encodeURIComponent(query)}`,
    { cache: 'no-store' }
  )
  const data = await res.json()
  return data.results || []
}
