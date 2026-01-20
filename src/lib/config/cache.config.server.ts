import { env } from '$env/dynamic/private';
import { CACHE_TTL as DEFAULT_CACHE_TTL } from './cache.config';

/**
 * Server-only cache configuration that can override defaults with environment variables
 * This file should only be imported in server-side code (e.g., +page.server.ts, +layout.server.ts)
 */

// Parse environment variable or use default (in milliseconds)
const getEnvTTL = (key: string, defaultValue: number): number => {
	const value = env[key];
	if (value) {
		const minutes = parseInt(value, 10);
		return isNaN(minutes) ? defaultValue : minutes * 60 * 1000;
	}
	return defaultValue;
};

/**
 * Cache TTL configuration with environment variable overrides
 * Values are loaded from environment variables with fallbacks to defaults from cache.config.ts
 */
export const CACHE_TTL = {
	PROFILE: getEnvTTL('CACHE_TTL_PROFILE', DEFAULT_CACHE_TTL.PROFILE),
	SITE_INFO: getEnvTTL('CACHE_TTL_SITE_INFO', DEFAULT_CACHE_TTL.SITE_INFO),
	LINKS: getEnvTTL('CACHE_TTL_LINKS', DEFAULT_CACHE_TTL.LINKS),
	MUSIC_STATUS: getEnvTTL('CACHE_TTL_MUSIC_STATUS', DEFAULT_CACHE_TTL.MUSIC_STATUS),
	KIBUN_STATUS: getEnvTTL('CACHE_TTL_KIBUN_STATUS', DEFAULT_CACHE_TTL.KIBUN_STATUS),
	TANGLED_REPOS: getEnvTTL('CACHE_TTL_TANGLED_REPOS', DEFAULT_CACHE_TTL.TANGLED_REPOS),
	BLOG_POSTS: getEnvTTL('CACHE_TTL_BLOG_POSTS', DEFAULT_CACHE_TTL.BLOG_POSTS),
	PUBLICATIONS: getEnvTTL('CACHE_TTL_PUBLICATIONS', DEFAULT_CACHE_TTL.PUBLICATIONS),
	INDIVIDUAL_POST: getEnvTTL('CACHE_TTL_INDIVIDUAL_POST', DEFAULT_CACHE_TTL.INDIVIDUAL_POST),
	IDENTITY: getEnvTTL('CACHE_TTL_IDENTITY', DEFAULT_CACHE_TTL.IDENTITY)
} as const;
