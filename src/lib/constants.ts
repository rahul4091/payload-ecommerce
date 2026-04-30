export const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export const SHIPPING_THRESHOLD = 500
export const SHIPPING_COST = 49

export function getImageUrl(url: string | undefined | null): string {
  if (!url) return ''

  // If it's already a full URL (Vercel Blob, external) — use as is
  if (url.startsWith('http')) {
    return url
  }

  // If it's a relative URL — prepend server URL
  return `${SERVER_URL}${url}`
}
