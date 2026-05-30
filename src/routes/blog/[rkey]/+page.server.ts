import type { PageServerLoad } from './$types';
import { fetchBlogPosts } from '$lib/services/atproto/fetch';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
    const { rkey } = params;
    const { posts } = await fetchBlogPosts();
    
    // Attempt to find post by rkey (some structures use .uri as at://.../rkey)
    const post = posts.find((p) => p.rkey === rkey || p.uri.endsWith(`/${rkey}`));

    if (!post) {
        throw error(404, 'Post not found');
    }

    return { post };
};
