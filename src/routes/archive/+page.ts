import type { PageLoad } from './$types';
import { createSiteMeta, type SiteMetadata } from '$lib/helper/siteMeta';
import { fetchDocuments } from '$lib/services/atproto';

export const load: PageLoad = async ({ fetch }) => {
	// Fetch all Standard.site documents
	let documents: import('$lib/services/atproto').StandardSiteDocument[] = [];

	try {
		const data = await fetchDocuments(fetch);
		documents = data.documents;
	} catch (err) {
		console.warn('Archive page: failed to fetch documents', err);
	}

	// Create page metadata
	const meta: Partial<SiteMetadata> = {
		title: 'Archive',
		description: `Browse all ${documents.length} documents from Standard.site`
	};

	return {
		meta,
		documents
	};
};
