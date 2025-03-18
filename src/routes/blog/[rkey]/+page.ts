import { fetchBlogPost } from "$lib/fetchBlogPost";
import { parse } from "$lib/parser";
import type { MarkdownPost } from "$lib/parser";

export const load = async ({ parent, params }) => {
    const parentData = await parent();
    const rkey = params.rkey;
    
    try {
        // Fetch the specific blog post
        const markdownPost = await fetchBlogPost(rkey);
        
        // Create a Map with just this post
        const mdpostsMap = new Map<string, MarkdownPost>();
        mdpostsMap.set(rkey, markdownPost);
        
        // Parse the Markdown to HTML
        const parsedPosts = await parse(mdpostsMap);
        
        return {
            ...parentData,
            rkey: params.rkey,
            posts: parsedPosts
        };
    } catch (error) {
        console.error("Error loading blog post:", error);
        
        // Return empty posts map if post couldn't be loaded
        return {
            ...parentData,
            rkey: params.rkey,
            posts: new Map()
        };
    }
};