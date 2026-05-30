import type { PageServerLoad } from './$types';
import { fetchBlogPosts, fetchBlob } from '$lib/services/atproto/fetch';
import { PUBLIC_LEAFLET_BLOG_PUBLICATION } from '$env/static/public';
import { error } from '@sveltejs/kit';
import { normalizeSlug } from '$lib/utils/slugify';
import { renderMarkdown } from '$lib/utils/markdown';
import { leafletProvider } from '$lib/providers/leaflet';

export const load: PageServerLoad = async ({ params }) => {
    const { year, month, day, slug } = params;
    const { posts } = await fetchBlogPosts();
    
    // Filter posts by the specific publication RKey
    const publicationPosts = posts.filter(p => p.publicationRkey === PUBLIC_LEAFLET_BLOG_PUBLICATION);

    const post = publicationPosts.find((p) => {
        const date = new Date(p.createdAt);
        const y = date.getFullYear().toString();
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const d = date.getDate().toString().padStart(2, '0');
        
        const postSlug = normalizeSlug(p.title); 
        
        return y === year && m === month && d === day && postSlug === slug;
    });

    if (!post) {
        throw error(404, 'Post not found');
    }

    let markdown = "";
    if (post.content && typeof post.content === 'object' && leafletProvider.matches(post.content)) {
        const result = await leafletProvider.toMarkdown(post.content, { fetchBlob });
        markdown = result.markdown;
    } else {
        markdown = typeof post.content === 'string' ? post.content : (post.textContent || "");
    }
    
    const renderedContent = await renderMarkdown(markdown);

    return { 
        post: {
            ...post,
            renderedContent
        }
    };
};
