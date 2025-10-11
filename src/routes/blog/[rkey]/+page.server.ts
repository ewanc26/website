import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, parent }) => {
  const { rkey } = params;
  const { posts, profile, sortedPosts } = await parent();
  
  // Get post directly from the posts Map
  const post = posts.get(rkey);
  if (!post) {
    throw error(404, 'Post not found');
  }
  
  // Calculate adjacent posts directly
  const currentIndex = sortedPosts.findIndex((p: any) => p.rkey === rkey);
  const adjacentPosts = {
    previous: currentIndex > 0 ? sortedPosts[currentIndex - 1] : null,
    next: currentIndex < sortedPosts.length - 1 ? sortedPosts[currentIndex + 1] : null
  };
  
  return {
    post,
    adjacentPosts,
    profile,
    rkey
  };
};
