import { dev } from '$app/environment';

/**
 * Cache configuration with environment-aware TTL values
 *
 * Development: Shorter TTLs for faster iteration
 * Production: Longer TTLs to reduce API calls and prevent timeouts
 */

// Parse environment variable or use default (in milliseconds)
const getEnvTTL = (key: string, defaultMinutes: number): number => {
	if (typeof process !== 'undefined' && process.env?.[key]) {
		const minutes = parseInt(process.env[key], 10);
		return isNaN(minutes) ? defaultMinutes * 60 * 1000 : minutes * 60 * 1000;
	}
	return defaultMinutes * 60 * 1000;
};

/**
 * Default TTL values (in minutes) for different data types
 *
 * Profile data changes infrequently, so we can cache it longer
 * Music and Kibun statuses change frequently, so shorter cache
 */
const DEFAULT_TTL = {
	// Profile data: 60 minutes (changes infrequently)
	PROFILE: dev ? 5 : 60,

	// Site info: 120 minutes (rarely changes)
	SITE_INFO: dev ? 5 : 120,

	// Links: 60 minutes (changes occasionally)
	LINKS: dev ? 5 : 60,

	// Music status: 10 minutes (changes frequently)
	MUSIC_STATUS: dev ? 2 : 10,

	// Kibun status: 15 minutes (changes occasionally)
	KIBUN_STATUS: dev ? 2 : 15,

	// Tangled repos: 60 minutes (changes occasionally)
	TANGLED_REPOS: dev ? 5 : 60,

	// Blog posts: 30 minutes (balance between freshness and performance)
	BLOG_POSTS: dev ? 5 : 30,

	// Publications: 60 minutes (rarely changes)
	PUBLICATIONS: dev ? 5 : 60,

	// Individual posts: 60 minutes (content doesn't change)
	INDIVIDUAL_POST: dev ? 5 : 60,

	// Identity resolution: 1440 minutes (24 hours - DIDs are stable)
	IDENTITY: dev ? 30 : 1440
};

/**
 * Cache TTL configuration
 * Values are loaded from environment variables with fallbacks to defaults
 */
export const CACHE_TTL = {
	PROFILE: getEnvTTL('CACHE_TTL_PROFILE', DEFAULT_TTL.PROFILE),
	SITE_INFO: getEnvTTL('CACHE_TTL_SITE_INFO', DEFAULT_TTL.SITE_INFO),
	LINKS: getEnvTTL('CACHE_TTL_LINKS', DEFAULT_TTL.LINKS),
	MUSIC_STATUS: getEnvTTL('CACHE_TTL_MUSIC_STATUS', DEFAULT_TTL.MUSIC_STATUS),
	KIBUN_STATUS: getEnvTTL('CACHE_TTL_KIBUN_STATUS', DEFAULT_TTL.KIBUN_STATUS),
	TANGLED_REPOS: getEnvTTL('CACHE_TTL_TANGLED_REPOS', DEFAULT_TTL.TANGLED_REPOS),
	BLOG_POSTS: getEnvTTL('CACHE_TTL_BLOG_POSTS', DEFAULT_TTL.BLOG_POSTS),
	PUBLICATIONS: getEnvTTL('CACHE_TTL_PUBLICATIONS', DEFAULT_TTL.PUBLICATIONS),
	INDIVIDUAL_POST: getEnvTTL('CACHE_TTL_INDIVIDUAL_POST', DEFAULT_TTL.INDIVIDUAL_POST),
	IDENTITY: getEnvTTL('CACHE_TTL_IDENTITY', DEFAULT_TTL.IDENTITY)
} as const;

/**
 * HTTP Cache-Control header values for different routes
 * These tell browsers and CDNs how long to cache responses
 *
 * Format: max-age=X (browser cache), s-maxage=Y (CDN cache), stale-while-revalidate=Z
 */
export const HTTP_CACHE_HEADERS = {
	// Layout data (profile, site info) - cache aggressively
	LAYOUT: `public, max-age=${CACHE_TTL.PROFILE / 1000}, s-maxage=${CACHE_TTL.PROFILE / 1000}, stale-while-revalidate=${CACHE_TTL.PROFILE / 1000}`,

	// Blog posts listing - moderate caching
	BLOG_LISTING: `public, max-age=${CACHE_TTL.BLOG_POSTS / 1000}, s-maxage=${CACHE_TTL.BLOG_POSTS / 1000}, stale-while-revalidate=${CACHE_TTL.BLOG_POSTS / 1000}`,

	// Individual blog post - cache aggressively (content doesn't change)
	BLOG_POST: `public, max-age=${CACHE_TTL.INDIVIDUAL_POST / 1000}, s-maxage=${CACHE_TTL.INDIVIDUAL_POST / 1000}, stale-while-revalidate=${CACHE_TTL.INDIVIDUAL_POST / 1000}`,

	// Music status - short cache (changes frequently)
	MUSIC_STATUS: `public, max-age=${CACHE_TTL.MUSIC_STATUS / 1000}, s-maxage=${CACHE_TTL.MUSIC_STATUS / 1000}, stale-while-revalidate=${CACHE_TTL.MUSIC_STATUS / 1000}`,

	// API endpoints - moderate caching
	API: `public, max-age=300, s-maxage=300, stale-while-revalidate=600`
} as const;
