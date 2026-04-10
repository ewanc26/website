import type { PageLoad } from './$types';
import { createDynamicSiteMeta } from '$lib/helper/siteMeta';
import {
	fetchMusicStatus,
	fetchKibunStatus,
	fetchLatestBlueskyPost,
	fetchTangledRepos,
	fetchRecentDocuments,
	fetchAllSupporters,
	fetchRecentPopfeedReviews
} from '$lib/services/atproto';

export const load: PageLoad = async ({ fetch, parent }) => {
	const { profile } = await parent();

	const [musicStatus, kibunStatus, latestPost, tangledRepos, documents, supporters, popfeedReview] = await Promise.allSettled([
		fetchMusicStatus(fetch),
		fetchKibunStatus(fetch),
		fetchLatestBlueskyPost(fetch),
		fetchTangledRepos(fetch),
		fetchRecentDocuments(5, fetch),
		fetchAllSupporters(),
		fetchRecentPopfeedReviews(fetch)
	]);

	// Create page metadata with dynamic OG
	const meta = createDynamicSiteMeta({
		title: "Ewan's Corner",
		description: 'personal site, blog, and digital garden'
	});

	return {
		profile,
		meta,
		musicStatus: musicStatus.status === 'fulfilled' ? musicStatus.value : null,
		kibunStatus: kibunStatus.status === 'fulfilled' ? kibunStatus.value : null,
		latestPost: latestPost.status === 'fulfilled' ? latestPost.value : null,
		tangledRepos: tangledRepos.status === 'fulfilled' ? tangledRepos.value : null,
		documents: documents.status === 'fulfilled' ? documents.value : [],
		supporters: supporters.status === 'fulfilled' ? supporters.value : [],
		popfeedReviews: popfeedReview.status === 'fulfilled' ? popfeedReview.value : []
	};
};
