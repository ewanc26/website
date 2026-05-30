import type { PageServerLoad } from './$types';
import { fetchKibunStatus, fetchBlogPosts } from '$lib/services/atproto/fetch';
import { PUBLIC_LEAFLET_BLOG_PUBLICATION } from '$env/static/public';

export const load: PageServerLoad = async () => {
	const [kibunStatus, { posts }] = await Promise.all([
        fetchKibunStatus(),
        fetchBlogPosts()
    ]);

    // Filter posts by the specific publication RKey
    const publicationPosts = posts.filter(p => p.publicationRkey === PUBLIC_LEAFLET_BLOG_PUBLICATION);
    
	return {
		kibunStatus,
        posts: publicationPosts
	};
};

