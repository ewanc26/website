import type { PageServerLoad } from './$types';
import { fetchBlogPosts } from '$lib/services/atproto/fetch';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
    const { year, month, day, slug } = params;
    const { posts } = await fetchBlogPosts();
    
    const post = posts.find((p) => {
        const date = new Date(p.createdAt);
        const y = date.getFullYear().toString();
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const d = date.getDate().toString().padStart(2, '0');
        
        // This is a naive slug mapping, will need adjustment based on real BlogPost structure
        const postSlug = p.title.toLowerCase().replace(/ /g, '-'); 
        
        return y === year && m === month && d === day && postSlug === slug;
    });

    if (!post) {
        throw error(404, 'Post not found');
    }

    return { post };
};
