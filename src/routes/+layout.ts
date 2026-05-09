import type { LayoutLoad } from './$types';
import { createSiteMeta, type SiteMetadata, defaultSiteMeta } from '$lib/helper/siteMeta';
import { fetchProfile, fetchSiteInfo } from '$lib/services/atproto';

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
 * Layout load function - fetches profile and site info, provides base site metadata
 */
export const load: LayoutLoad = async ({ url, fetch }) => {
	// Provide the default site metadata with current URL for proper OG tags
	const siteMeta: SiteMetadata = createSiteMeta({
		...defaultSiteMeta,
		url: url.href
	});

	// Fetch profile data (needed by Header and Footer)
	// Fetch site info (needed by Footer for copyright year)
	const [profile, siteInfo] = await Promise.all([
		withTimeout(fetchProfile(fetch), REQUEST_TIMEOUT),
		withTimeout(fetchSiteInfo(fetch), REQUEST_TIMEOUT)
	]);

	return {
		siteMeta,
		profile,
		siteInfo
	};
};
