import type { PageServerLoad } from "./$types";
import { fetchBlogPosts } from "@ewanc26/atproto";
import { PUBLIC_ATPROTO_DID } from "$env/static/public";
import { error, redirect } from "@sveltejs/kit";
import { normalizeSlug } from "$lib/utils/slugify";

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

  const date = new Date(post.createdAt);
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  const slug = normalizeSlug(post.title);

  throw redirect(301, `/blog/${y}/${m}/${d}/${slug}`);
};
