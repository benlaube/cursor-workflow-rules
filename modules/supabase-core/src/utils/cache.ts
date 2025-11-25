/**
 * Cache Utilities
 * 
 * Simple in-memory caching for Supabase query results.
 * For production use, consider Redis or a more robust caching solution.
 * 
 * Note: This is a basic implementation. For production, use a proper cache like Redis.
 */

/**
 * Cache entry with expiration.
 */
interface CacheEntry<T> {
  data: T
  expiresAt: number
}

/**
 * Simple in-memory cache for Supabase query results.
 * 
 * @example
 * ```typescript
 * const cache = new QueryCache()
 * 
 * // Cache a query result
 * const key = 'posts:published'
 * const { data } = await supabase.from('posts').select('*').eq('published', true)
 * cache.set(key, data, 300) // Cache for 5 minutes
 * 
 * // Retrieve from cache
 * const cached = cache.get(key)
 * if (cached) {
 *   return cached
 * }
 * ```
 */
export class QueryCache {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private defaultTTL: number = 300 // 5 minutes

  /**
   * Sets a cache entry.
   * 
   * @param key - Cache key
   * @param data - Data to cache
   * @param ttlSeconds - Time to live in seconds (default: 5 minutes)
   */
  set<T>(key: string, data: T, ttlSeconds?: number): void {
    const ttl = ttlSeconds || this.defaultTTL
    const expiresAt = Date.now() + ttl * 1000

    this.cache.set(key, {
      data,
      expiresAt,
    })
  }

  /**
   * Gets a cache entry.
   * Returns null if not found or expired.
   * 
   * @param key - Cache key
   * @returns Cached data or null
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * Deletes a cache entry.
   * 
   * @param key - Cache key
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Clears all cache entries.
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Cleans up expired entries.
   * Call this periodically to free memory.
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Gets cache statistics.
   * 
   * @returns Cache stats
   */
  getStats(): {
    size: number
    entries: number
  } {
    this.cleanup() // Clean up before counting
    return {
      size: this.cache.size,
      entries: this.cache.size,
    }
  }
}

/**
 * Global cache instance.
 * Use this for simple caching needs.
 */
export const globalCache = new QueryCache()

/**
 * Creates a cache key from query parameters.
 * Useful for generating consistent cache keys.
 * 
 * @param table - Table name
 * @param params - Query parameters
 * @returns Cache key string
 * 
 * @example
 * ```typescript
 * const key = createCacheKey('posts', { published: true, limit: 10 })
 * // Returns: 'posts:published=true:limit=10'
 * ```
 */
export function createCacheKey(table: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${JSON.stringify(params[key])}`)
    .join(':')

  return `${table}:${sortedParams}`
}

