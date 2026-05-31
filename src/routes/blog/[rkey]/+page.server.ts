import type { PageServerLoad } from "./$types";
import { fetchBlogPosts } from "@ewanc26/atproto";
import { PUBLIC_ATPROTO_DID } from "$env/static/public";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params, fetch }) => {
  const { rkey } = params;
  const { posts } = await fetchBlogPosts(PUBLIC_ATPROTO_DID, fetch);

  // Attempt to find post by rkey (some structures use .uri as at://.../rkey)
  const post = posts.find((p) => p.rkey === rkey || p.uri.endsWith(`/${rkey}`));

  if (!post) {
    throw error(404, "Post not found");
  }

  return { post };
};
