import type { PageLoad } from './$types';
import {
	fetchMusicStatus,
	fetchKibunStatus,
	fetchLatestBlueskyPost,
	fetchTangledRepos,
	fetchRecentDocuments
} from '$lib/services/atproto';

export const load: PageLoad = async ({ fetch, parent }) => {
	// Get parent data (includes profile from layout)
	const { profile } = await parent();

	// Fetch page-specific data in parallel for better performance
	const [musicStatus, kibunStatus, latestPost, tangledRepos, documents] = await Promise.allSettled([
		fetchMusicStatus(fetch),
		fetchKibunStatus(fetch),
		fetchLatestBlueskyPost(fetch),
		fetchTangledRepos(fetch),
		fetchRecentDocuments(5, fetch) // Fetch 5 most recent documents
	]);

	return {
		// Pass through profile from parent
		profile,
		// Page-specific data
		musicStatus: musicStatus.status === 'fulfilled' ? musicStatus.value : null,
		kibunStatus: kibunStatus.status === 'fulfilled' ? kibunStatus.value : null,
		latestPost: latestPost.status === 'fulfilled' ? latestPost.value : null,
		tangledRepos: tangledRepos.status === 'fulfilled' ? tangledRepos.value : null,
		documents: documents.status === 'fulfilled' ? documents.value : []
	};
};
