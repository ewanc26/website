import { dev } from '$app/environment';

/**
 * Cache configuration with environment-aware TTL values
 *
 * Development: Shorter TTLs for faster iteration
 * Production: Longer TTLs to reduce API calls and prevent timeouts
 */

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
 * Cache TTL configuration in milliseconds
 * These are the default values - can be overridden via environment variables in server code
 */
export const CACHE_TTL = {
	PROFILE: DEFAULT_TTL.PROFILE * 60 * 1000,
	SITE_INFO: DEFAULT_TTL.SITE_INFO * 60 * 1000,
	LINKS: DEFAULT_TTL.LINKS * 60 * 1000,
	MUSIC_STATUS: DEFAULT_TTL.MUSIC_STATUS * 60 * 1000,
	KIBUN_STATUS: DEFAULT_TTL.KIBUN_STATUS * 60 * 1000,
	TANGLED_REPOS: DEFAULT_TTL.TANGLED_REPOS * 60 * 1000,
	BLOG_POSTS: DEFAULT_TTL.BLOG_POSTS * 60 * 1000,
	PUBLICATIONS: DEFAULT_TTL.PUBLICATIONS * 60 * 1000,
	INDIVIDUAL_POST: DEFAULT_TTL.INDIVIDUAL_POST * 60 * 1000,
	IDENTITY: DEFAULT_TTL.IDENTITY * 60 * 1000
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
