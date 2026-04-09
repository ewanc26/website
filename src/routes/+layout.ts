import type { LayoutLoad } from './$types';
import { createSiteMeta, type SiteMetadata, defaultSiteMeta } from '$lib/helper/siteMeta';
import { fetchProfile } from '$lib/services/atproto';

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
		profile = await fetchProfile(fetch);
	} catch (error) {
		console.error('[Layout] Failed to load profile:', error);
	}

	return {
		siteMeta,
		profile
	};
};
