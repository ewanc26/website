import { fetchBlogPosts } from "@ewanc26/atproto";
import { PUBLIC_ATPROTO_DID } from "$env/static/public";
import { normalizeSlug } from "$lib/utils/slugify";
import { blogDateParts } from "$lib/utils/date";
import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

// Legacy short-URL support: /blog/<rkey> redirects to the canonical dated path.
export const load: PageServerLoad = async ({ params, fetch }) => {
  const { posts } = await fetchBlogPosts(PUBLIC_ATPROTO_DID, fetch).catch(() => ({ posts: [] }));
  const post = posts.find((p) => p.rkey === params.rkey || p.url.endsWith(`/${params.rkey}`));
  if (!post) error(404, "Post not found");

  const { year, month, day } = blogDateParts(post.createdAt);
  redirect(301, `/blog/${year}/${month}/${day}/${normalizeSlug(post.title)}`);
};
