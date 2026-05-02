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

/**
 * Wraps a promise with a timeout. Returns null on timeout or rejection,
 * so it's safe to use with Promise.allSettled.
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

/** Per-request timeout — keeps Vercel serverless functions under the 10s limit. */
const REQUEST_TIMEOUT = 8_000;

export const load: PageLoad = async ({ fetch, parent }) => {
	const { profile } = await parent();

	const [musicStatus, kibunStatus, latestPost, documents, supporters, popfeedReview] =
		await Promise.allSettled([
			withTimeout(fetchMusicStatus(fetch), REQUEST_TIMEOUT),
			withTimeout(fetchKibunStatus(fetch), REQUEST_TIMEOUT),
			withTimeout(fetchLatestBlueskyPost(fetch), REQUEST_TIMEOUT),
			withTimeout(fetchRecentDocuments(5, fetch), REQUEST_TIMEOUT),
			withTimeout(fetchAllSupporters(), REQUEST_TIMEOUT),
			withTimeout(fetchRecentPopfeedReviews(fetch), REQUEST_TIMEOUT)
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
