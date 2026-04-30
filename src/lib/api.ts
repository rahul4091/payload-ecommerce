const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://payload-ecommerce-eight.vercel.app'

const API_URL = typeof window !== "undefined"
  ? "/api"
  : `${SERVER_URL}/api`

export async function getProducts(categoryId?: string, page = 1) {
  try {
    let url = `${API_URL}/products?depth=1&limit=12&page=${page}`
    if (categoryId) url += `&where[category][equals]=${categoryId}`
    const res = await fetch(url, { next: { revalidate: 60 } })
    if (!res.ok) return { docs: [], totalPages: 1, page: 1 }
    const data = await res.json()
    return { docs: data.docs || [], totalPages: data.totalPages || 1, page: data.page || 1 }
  } catch (err) {
    console.error('getProducts failed:', err)
    return { docs: [], totalPages: 1, page: 1 }
  }
}

export async function getProduct(id: string) {
  try {
    const res = await fetch(`${API_URL}/products/${id}?depth=2`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    return res.json()
  } catch (err) {
    console.error('getProduct failed:', err)
    return null
  }
}

export async function getCategories() {
  try {
    const res = await fetch(`${API_URL}/categories?limit=100`, { next: { revalidate: 300 } })
    if (!res.ok) return []
    const data = await res.json()
    return data.docs || []
  } catch (err) {
    console.error('getCategories failed:', err)
    return []
  }
}

export async function getFeaturedProducts() {
  try {
    const res = await fetch(`${API_URL}/products?where[inStock][equals]=true&depth=1&limit=8`, { next: { revalidate: 60 } })
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

export async function searchProducts(query: string) {
  const res = await fetch(
    `${API_URL}/products/search?q=${encodeURIComponent(query)}`,
    { cache: 'no-store' }
  )
  const data = await res.json()
  return data.results || []
}

export async function getProductReviews(productId: string) {
  const res = await fetch(
    `${API_URL}/reviews?where[product][equals]=${productId}&depth=1&limit=20`,
    { next: { revalidate: 60 } }
  )
  const data = await res.json()
  return data.docs || []
}

export async function submitReview(reviewData: any, token: string) {
  const res = await fetch(`${API_URL}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `JWT ${token}`,
    },
    body: JSON.stringify(reviewData),
  })
  return res.json()
}
