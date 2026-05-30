import type { PageServerLoad } from './$types';
import { fetchKibunStatus, fetchBlogPosts } from '$lib/services/atproto/fetch';

export const load: PageServerLoad = async () => {
	const [kibunStatus, { posts }] = await Promise.all([
        fetchKibunStatus(),
        fetchBlogPosts()
    ]);
	return {
		kibunStatus,
        posts
	};
};

