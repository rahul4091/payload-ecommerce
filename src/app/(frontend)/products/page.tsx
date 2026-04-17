import type { Metadata } from 'next'
import { getProducts, getCategories } from '@/lib/api'
import ProductsClient from './ProductsClient'

export const metadata: Metadata = {
  title: 'All Products',
  description: 'Browse our full collection of products.',
  openGraph: {
    title: 'All Products | My Store',
    description: 'Browse our full collection of products.',
  },
}

export default async function ProductsPage() {
  const [result, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ])

  return (
    <ProductsClient
      initialProducts={result.docs}
      initialTotalPages={result.totalPages}
      categories={categories}
    />
  )
}
