import type { PageLoad } from './$types';
import { createDynamicSiteMeta } from '$lib/helper/siteMeta';
import { PUBLIC_SITE_TITLE } from '$env/static/public';
import {
	fetchMusicStatus,
	fetchKibunStatus,
	fetchLatestBlueskyPost,
	fetchRecentDocuments,
	fetchAllSupporters,
	fetchRecentPopfeedReviews
} from '$lib/services/atproto';

export const load: PageLoad = async ({ fetch, parent }) => {
	const { profile } = await parent();

	const [musicStatus, kibunStatus, latestPost, documents, supporters, popfeedReview] =
		await Promise.allSettled([
			fetchMusicStatus(fetch),
			fetchKibunStatus(fetch),
			fetchLatestBlueskyPost(fetch),
			fetchRecentDocuments(5, fetch),
			fetchAllSupporters(),
			fetchRecentPopfeedReviews(fetch)
		]);

	// Create page metadata with dynamic OG
	const meta = createDynamicSiteMeta({
		title: PUBLIC_SITE_TITLE,
		description: 'personal site, blog, and digital garden'
	});

	return {
		profile,
		meta,
		musicStatus: musicStatus.status === 'fulfilled' ? musicStatus.value : null,
		kibunStatus: kibunStatus.status === 'fulfilled' ? kibunStatus.value : null,
		latestPost: latestPost.status === 'fulfilled' ? latestPost.value : null,
		documents: documents.status === 'fulfilled' ? documents.value : [],
		supporters: supporters.status === 'fulfilled' ? supporters.value : [],
		popfeedReviews: popfeedReview.status === 'fulfilled' ? popfeedReview.value : []
	};
};
