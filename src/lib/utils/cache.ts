// Server-side in-memory TTL cache (for server endpoints)
export interface CacheEntry<T> {
  value: T | undefined;
  timestamp: number;
}

export class TTLCache<T> {
  private entry: CacheEntry<T> = { value: undefined, timestamp: 0 };
  constructor(private ttlMs: number) {}

  get(): T | undefined {
    if (Date.now() - this.entry.timestamp > this.ttlMs) {
      this.entry.value = undefined;
    }
    return this.entry.value;
  }

  set(value: T) {
    this.entry.value = value;
    this.entry.timestamp = Date.now();
  }

  clear() {
    this.entry.value = undefined;
    this.entry.timestamp = 0;
  }
}
/**
 * Caches data in localStorage with a specified expiry time.
 * @param key The key to store the data under.
 * @param data The data to store.
 * @param ttl The time-to-live for the cache in milliseconds (default: 1 hour).
 */
export function setCache<T>(key: string, data: T, ttl: number = 3600000): void {
  if (typeof window === 'undefined') {
    return; // Don't cache on the server
  }
  const now = new Date().getTime();
  const item = {
    data: data,
    expiry: now + ttl,
  };
  localStorage.setItem(key, JSON.stringify(item));
}

/**
 * Retrieves data from localStorage if it's not expired.
 * @param key The key to retrieve the data from.
 * @returns The cached data, or null if expired or not found.
 */
export function getCache<T>(key: string): T | null {
  if (typeof window === 'undefined') {
    return null; // No cache on the server
  }
  const itemStr = localStorage.getItem(key);
  if (!itemStr) {
    return null;
  }
  const item = JSON.parse(itemStr);
  const now = new Date().getTime();
  if (now > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  return item.data;
}