/**
 * In-memory TTL cache for API responses.
 * Keeps warm Vercel function instances responsive without
 * external cache infrastructure. Data lives per-instance only.
 */

const cache = new Map<string, { data: any; expiry: number }>();

/**
 * Retrieve a cached value, or null if expired or absent.
 */
export function getCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

/**
 * Store a value in cache with a TTL in milliseconds.
 */
export function setCache<T>(key: string, data: T, ttlMs: number) {
  cache.set(key, { data, expiry: Date.now() + ttlMs });
}
