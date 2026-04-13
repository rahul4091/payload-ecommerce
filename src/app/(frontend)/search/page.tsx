import { Suspense } from 'react'
import SearchResults from './SearchResults'

export const dynamic = 'force-dynamic'

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Searching...</div>}>
      <SearchResults />
    </Suspense>
  )
}
