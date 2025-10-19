import type { LayoutLoad } from './$types';
import { createSiteMeta, type SiteMetadata, defaultSiteMeta } from '$lib/helper/siteMeta';

export const load: LayoutLoad = async ({ url }) => {
	// Provide the default site metadata
	const siteMeta: SiteMetadata = createSiteMeta({
		title: defaultSiteMeta.title,
		description: defaultSiteMeta.description,
		url: url.href // Include current URL for proper OG tags
	});

	return { siteMeta };
};
