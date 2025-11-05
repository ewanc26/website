import type { LayoutLoad } from './$types';
import { createSiteMeta, type SiteMetadata, defaultSiteMeta } from '$lib/helper/siteMeta';
import { fetchProfile, fetchSiteInfo } from '$lib/services/atproto';

export const load: LayoutLoad = async ({ url, fetch }) => {
	// Provide the default site metadata
	const siteMeta: SiteMetadata = createSiteMeta({
		title: defaultSiteMeta.title,
		description: defaultSiteMeta.description,
		url: url.href // Include current URL for proper OG tags
	});

	// Fetch lightweight public data for layout using injected fetch
	let profile = null;
	let siteInfo = null;

	try {
		profile = await fetchProfile(fetch);
	} catch (err) {
		// Non-fatal: layout should still render even if profile fails
		console.warn('Layout: failed to fetch profile in load', err);
	}

	try {
		siteInfo = await fetchSiteInfo(fetch);
	} catch (err) {
		console.warn('Layout: failed to fetch siteInfo in load', err);
	}

	return { siteMeta, profile, siteInfo };
};
