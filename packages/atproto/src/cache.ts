import type { CacheEntry } from './types.js';

/**
 * Cache TTL values in milliseconds (production defaults).
 * All functions that previously read PUBLIC_ATPROTO_DID from the environment
 * now accept `did: string` as their first argument.
 */
export const CACHE_TTL = {
	PROFILE: 60 * 60 * 1000,
	SITE_INFO: 120 * 60 * 1000,
	LINKS: 60 * 60 * 1000,
	MUSIC_STATUS: 10 * 60 * 1000,
	KIBUN_STATUS: 15 * 60 * 1000,
	TANGLED_REPOS: 60 * 60 * 1000,
	BLOG_POSTS: 30 * 60 * 1000,
	PUBLICATIONS: 60 * 60 * 1000,
	INDIVIDUAL_POST: 60 * 60 * 1000,
	IDENTITY: 24 * 60 * 60 * 1000
} as const;

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
		if (key.startsWith('publications:') || key.startsWith('standard-site:publications:'))
			return CACHE_TTL.PUBLICATIONS;
		if (key.startsWith('post:') || key.startsWith('blueskypost:')) return CACHE_TTL.INDIVIDUAL_POST;
		if (key.startsWith('identity:')) return CACHE_TTL.IDENTITY;
		return 30 * 60 * 1000;
	}

	get<T>(key: string): T | null {
		const entry = this.cache.get(key);
		if (!entry) return null;
		const ttl = this.getTTL(key);
		if (Date.now() - entry.timestamp > ttl) {
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
