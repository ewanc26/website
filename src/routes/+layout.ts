import type { LayoutLoad } from './$types';
import { createSiteMeta, type SiteMetadata, defaultSiteMeta } from '$lib/helper/siteMeta';
import { fetchProfile } from '$lib/services/atproto';

/**
 * Wraps a promise with a timeout. Returns null on timeout or rejection.
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
	return new Promise((resolve) => {
		const timer = setTimeout(() => resolve(null), ms);
		promise.then(
			(value) => {
				clearTimeout(timer);
				resolve(value);
			},
			() => {
				clearTimeout(timer);
				resolve(null);
			}
		);
	});
}

const REQUEST_TIMEOUT = 8_000;

/**
 * Layout load function - fetches profile data and provides base site metadata
 */
export const load: LayoutLoad = async ({ url, fetch }) => {
	// Provide the default site metadata with current URL for proper OG tags
	const siteMeta: SiteMetadata = createSiteMeta({
		...defaultSiteMeta,
		url: url.href
	});

	// Fetch profile data (needed by Header and page components)
	let profile = null;
	try {
		profile = await withTimeout(fetchProfile(fetch), REQUEST_TIMEOUT);
	} catch (error) {
		console.error('[Layout] Failed to load profile:', error);
	}

	return {
		siteMeta,
		profile
	};
};
