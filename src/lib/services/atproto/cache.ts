import type { CacheEntry } from './types';
import { CACHE_TTL } from '$lib/config/cache.config';

/**
 * Simple in-memory cache with configurable TTL support
 *
 * TTL values are configured per data type in cache.config.ts
 * and can be overridden via environment variables
 */
export class ATProtoCache {
	private cache = new Map<string, CacheEntry<any>>();

	/**
	 * Get TTL for a cache key based on its prefix
	 */
	private getTTL(key: string): number {
		if (key.startsWith('profile:')) return CACHE_TTL.PROFILE;
		if (key.startsWith('siteinfo:')) return CACHE_TTL.SITE_INFO;
		if (key.startsWith('links:')) return CACHE_TTL.LINKS;
		if (key.startsWith('music-status:')) return CACHE_TTL.MUSIC_STATUS;
		if (key.startsWith('kibun-status:')) return CACHE_TTL.KIBUN_STATUS;
		if (key.startsWith('tangled:')) return CACHE_TTL.TANGLED_REPOS;
		if (key.startsWith('blog-posts:')) return CACHE_TTL.BLOG_POSTS;
		if (key.startsWith('publications:')) return CACHE_TTL.PUBLICATIONS;
		if (key.startsWith('post:')) return CACHE_TTL.INDIVIDUAL_POST;
		if (key.startsWith('identity:')) return CACHE_TTL.IDENTITY;

		// Default fallback (30 minutes)
		return 30 * 60 * 1000;
	}

	get<T>(key: string): T | null {
		console.info(`[Cache] Getting key: ${key}`);
		const entry = this.cache.get(key);
		if (!entry) {
			console.info(`[Cache] Cache miss for key: ${key}`);
			return null;
		}

		const ttl = this.getTTL(key);
		const age = Date.now() - entry.timestamp;

		if (age > ttl) {
			console.info(`[Cache] Entry expired for key: ${key} (age: ${Math.round(age / 1000)}s, ttl: ${Math.round(ttl / 1000)}s)`);
			this.cache.delete(key);
			return null;
		}

		console.info(`[Cache] Cache hit for key: ${key} (age: ${Math.round(age / 1000)}s, ttl: ${Math.round(ttl / 1000)}s)`);
		return entry.data;
	}

	set<T>(key: string, data: T): void {
		const ttl = this.getTTL(key);
		console.info(`[Cache] Setting key: ${key} (ttl: ${Math.round(ttl / 1000)}s)`);
		this.cache.set(key, {
			data,
			timestamp: Date.now()
		});
	}

	delete(key: string): void {
		console.info(`[Cache] Deleting key: ${key}`);
		this.cache.delete(key);
	}

	clear(): void {
		this.cache.clear();
	}
}

export const cache = new ATProtoCache();
