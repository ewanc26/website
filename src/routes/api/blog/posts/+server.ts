import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { fetchBlogPosts } from "$lib/services/atproto/fetch";
import { PUBLIC_LEAFLET_BLOG_PUBLICATION } from "$env/static/public";

export const GET: RequestHandler = async ({ url }) => {
  const offset = Math.max(
    0,
    parseInt(url.searchParams.get("offset") ?? "0", 10),
  );
  const limit = Math.min(
    100,
    Math.max(1, parseInt(url.searchParams.get("limit") ?? "20", 10)),
  );

  const { posts } = await fetchBlogPosts();
  const publicationPosts = posts
    .filter((p) => p.publicationRkey === PUBLIC_LEAFLET_BLOG_PUBLICATION)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const page = publicationPosts
    .slice(offset, offset + limit)
    .map(({ title, createdAt, publicationRkey, rkey, url, tags }) => ({
      title,
      createdAt,
      publicationRkey,
      rkey,
      url,
      tags: tags || [],
    }));

  return json({
    posts: page,
    total: publicationPosts.length,
  });
};
