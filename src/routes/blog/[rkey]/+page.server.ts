import type { PageServerLoad } from "./$types";
import { fetchBlogPosts } from "@ewanc26/atproto";
import { PUBLIC_ATPROTO_DID } from "$env/static/public";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params, fetch }) => {
  const { rkey } = params;
  const { posts } = await fetchBlogPosts(PUBLIC_ATPROTO_DID, fetch).catch(
    () => ({
      posts: [],
    }),
  );

  const post = posts.find((p) => p.rkey === rkey || p.url.endsWith(`/${rkey}`));

  if (!post) {
    throw error(404, "Post not found");
  }

  // Fallback chain: Explicit description -> Clean slice of text content -> Default fallback string
  const descriptionFallback = post.description 
    ? post.description 
    : (post.textContent ? post.textContent.slice(0, 155).trim() + "..." : "Read the full post on the blog.");

  return {
    post: {
      title: post.title,
      description: descriptionFallback,
      createdAt: post.createdAt,
      content: post.content
    }
  };
};
