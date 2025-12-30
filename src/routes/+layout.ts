import type { LayoutLoad } from './$types';
import { createSiteMeta, type SiteMetadata, defaultSiteMeta } from '$lib/helper/siteMeta';

/**
 * Non-blocking layout load
 * Returns immediately with default site metadata
 * All data fetching happens client-side in components for faster initial page load
 */
export const load: LayoutLoad = async ({ url }) => {
	// Provide the default site metadata
	const siteMeta: SiteMetadata = createSiteMeta({
		title: defaultSiteMeta.title,
		description: defaultSiteMeta.description,
		url: url.href // Include current URL for proper OG tags
	});

	// Return immediately - no blocking data fetches
	// Components will fetch their own data client-side with skeletons
	return {
		siteMeta,
		profile: null,
		siteInfo: null
	};
};
