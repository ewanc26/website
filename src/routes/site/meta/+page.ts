import type { PageLoad } from './$types';
import { fetchSiteInfo, type SiteInfoData } from '$lib/services/atproto';
import { createDynamicSiteMeta } from '$lib/helper/siteMeta';

export const load: PageLoad = async ({ parent, fetch }) => {
	const { siteMeta } = await parent();

	let siteInfo: SiteInfoData | null = null;
	let error: string | null = null;

	try {
		siteInfo = await fetchSiteInfo(fetch);
	} catch (err) {
		error = err instanceof Error ? err.message : 'Failed to load site information';
	}

	const meta = createDynamicSiteMeta({
		title: 'Site Meta',
		description: 'Information about this website, its technology stack, and credits.'
	});

	return { siteInfo, error, meta };
};
