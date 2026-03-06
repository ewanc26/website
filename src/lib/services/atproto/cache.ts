import type { CacheEntry } from '@ewanc26/atproto';
import { CACHE_TTL } from '$lib/config/cache.config';

/**
 * App-level in-memory cache with dev-aware TTLs from cache.config.ts.
 * This wraps the same interface as @ewanc26/atproto's ATProtoCache but
 * uses environment-sensitive TTLs (shorter in dev, longer in prod).
 */
export class ATProtoCache {
	private cache = new Map<string, CacheEntry<any>>();

	private getTTL(key: string): number {
		if (key.startsWith('profile:')) return CACHE_TTL.PROFILE;
		if (key.startsWith('siteinfo:')) return CACHE_TTL.SITE_INFO;
		if (key.startsWith('links:')) return CACHE_TTL.LINKS;
		if (key.startsWith('music-status:')) return CACHE_TTL.MUSIC_STATUS;
		if (key.startsWith('kibun-status:')) return CACHE_TTL.KIBUN_STATUS;
		if (key.startsWith('tangled:')) return CACHE_TTL.TANGLED_REPOS;
		if (key.startsWith('blog-posts:') || key.startsWith('blogposts:')) return CACHE_TTL.BLOG_POSTS;
		if (
			key.startsWith('publications:') ||
			key.startsWith('standard-site:publications:')
		)
			return CACHE_TTL.PUBLICATIONS;
		if (key.startsWith('post:') || key.startsWith('blueskypost:'))
			return CACHE_TTL.INDIVIDUAL_POST;
		if (key.startsWith('identity:')) return CACHE_TTL.IDENTITY;
		return 30 * 60 * 1000;
	}

	get<T>(key: string): T | null {
		const entry = this.cache.get(key);
		if (!entry) return null;
		if (Date.now() - entry.timestamp > this.getTTL(key)) {
			this.cache.delete(key);
			return null;
		}
		return entry.data;
	}

	set<T>(key: string, data: T): void {
		this.cache.set(key, { data, timestamp: Date.now() });
	}

	delete(key: string): void {
		this.cache.delete(key);
	}

	clear(): void {
		this.cache.clear();
	}
}

export const cache = new ATProtoCache();
export { CACHE_TTL };
