export const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

// Use this for ALL image URLs
export function getImageUrl(url: string | undefined | null): string {
  if (!url) return ''
  if (url.startsWith('http')) {
    // Replace any wrong domain with the correct one
    return url.replace(/https:\/\/[^/]+/, SERVER_URL)
  }
  return `${SERVER_URL}${url}`
}
