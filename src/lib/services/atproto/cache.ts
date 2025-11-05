import type { CacheEntry } from './types';

/**
 * Simple in-memory cache with TTL support
 */
export class ATProtoCache {
	private cache = new Map<string, CacheEntry<any>>();
	private readonly TTL = 5 * 60 * 1000; // 5 minutes

	get<T>(key: string): T | null {
		console.debug(`[Cache] Getting key: ${key}`);
		const entry = this.cache.get(key);
		if (!entry) {
			console.debug(`[Cache] Cache miss for key: ${key}`);
			return null;
		}

		if (Date.now() - entry.timestamp > this.TTL) {
			console.debug(`[Cache] Entry expired for key: ${key}`);
			this.cache.delete(key);
			return null;
		}

		console.debug(`[Cache] Cache hit for key: ${key}`);
		return entry.data;
	}

	set<T>(key: string, data: T): void {
		console.debug(`[Cache] Setting key: ${key}`, data);
		this.cache.set(key, {
			data,
			timestamp: Date.now()
		});
	}

	delete(key: string): void {
		console.debug(`[Cache] Deleting key: ${key}`);
		this.cache.delete(key);
	}

	clear(): void {
		this.cache.clear();
	}
}

export const cache = new ATProtoCache();
