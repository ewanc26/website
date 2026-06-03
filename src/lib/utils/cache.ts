// src/lib/utils/cache.ts
const cache = new Map<string, { data: any; expiry: number }>();

export function getCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCache<T>(key: string, data: T, ttlMs: number) {
  cache.set(key, { data, expiry: Date.now() + ttlMs });
}
