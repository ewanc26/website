import type { LayoutServerLoad } from './$types';
import { loadAllPosts } from '$lib/services/blogService';

export const load: LayoutServerLoad = async ({ fetch }) => {
  const blogService = await loadAllPosts(fetch);
  
  // Return ONLY serializable data - no functions!
  return {
    posts: blogService.posts,
    profile: blogService.profile,
    sortedPosts: blogService.sortedPosts
  };
};
