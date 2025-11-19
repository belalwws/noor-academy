// Image cache to prevent repeated requests and reduce backend rate limiting

interface CachedImage {
  url: string
  timestamp: number
  expiresAt: number
}

// Cache storage (in-memory, cleared on page reload)
const imageCache = new Map<string, CachedImage>()

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000

// Maximum cache size
const MAX_CACHE_SIZE = 100

/**
 * Get cached image URL if available and not expired
 */
export const getCachedImageUrl = (originalUrl: string): string | null => {
  if (!originalUrl) return null
  
  const cached = imageCache.get(originalUrl)
  
  if (cached && Date.now() < cached.expiresAt) {
    console.log('✅ Image cache hit:', originalUrl)
    return cached.url
  }
  
  // Remove expired entry
  if (cached) {
    imageCache.delete(originalUrl)
  }
  
  return null
}

/**
 * Cache an image URL
 */
export const cacheImageUrl = (originalUrl: string, proxiedUrl: string): void => {
  if (!originalUrl || !proxiedUrl) return
  
  // If cache is full, remove oldest entries
  if (imageCache.size >= MAX_CACHE_SIZE) {
    const entries = Array.from(imageCache.entries())
    // Sort by timestamp (oldest first)
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
    // Remove oldest 20% of entries
    const toRemove = Math.floor(MAX_CACHE_SIZE * 0.2)
    for (let i = 0; i < toRemove; i++) {
      imageCache.delete(entries[i][0])
    }
  }
  
  imageCache.set(originalUrl, {
    url: proxiedUrl,
    timestamp: Date.now(),
    expiresAt: Date.now() + CACHE_DURATION
  })
  
  console.log('💾 Image cached:', { originalUrl, proxiedUrl, cacheSize: imageCache.size })
}

/**
 * Clear expired cache entries
 */
export const clearExpiredCache = (): void => {
  const now = Date.now()
  let cleared = 0
  
  for (const [url, cached] of imageCache.entries()) {
    if (now >= cached.expiresAt) {
      imageCache.delete(url)
      cleared++
    }
  }
  
  if (cleared > 0) {
    console.log(`🧹 Cleared ${cleared} expired cache entries`)
  }
}

/**
 * Clear all cache
 */
export const clearAllCache = (): void => {
  imageCache.clear()
  console.log('🗑️ All image cache cleared')
}

// Clean up expired entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(clearExpiredCache, 5 * 60 * 1000)
}



















