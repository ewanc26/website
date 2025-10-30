import type { CacheEntry } from './types';

/**
 * Simple in-memory cache with TTL support
 */
export class ATProtoCache {
	private cache = new Map<string, CacheEntry<any>>();
	private readonly TTL = 5 * 60 * 1000; // 5 minutes

	get<T>(key: string): T | null {
		const entry = this.cache.get(key);
		if (!entry) return null;

		if (Date.now() - entry.timestamp > this.TTL) {
			this.cache.delete(key);
			return null;
		}

		return entry.data;
	}

	set<T>(key: string, data: T): void {
		this.cache.set(key, {
			data,
			timestamp: Date.now()
		});
	}

	delete(key: string): void {
		this.cache.delete(key);
	}

	clear(): void {
		this.cache.clear();
	}
}

export const cache = new ATProtoCache();
