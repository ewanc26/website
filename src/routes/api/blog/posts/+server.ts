import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { fetchBlogPosts } from "$lib/services/atproto/fetch";
import { PUBLIC_LEAFLET_BLOG_PUBLICATION } from "$env/static/public";
import type { Config } from "@sveltejs/adapter-vercel";
import { normalizeTag } from "$lib/utils/tags";

export const config: Config = { maxDuration: 30 };

export const GET: RequestHandler = async ({ url }) => {
  /** parseInt returns NaN for junk input, which silently slices to nothing. */
  const intParam = (name: string, fallback: number) => {
    const parsed = parseInt(url.searchParams.get(name) ?? "", 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const offset = Math.max(0, intParam("offset", 0));
  const limit = Math.min(100, Math.max(1, intParam("limit", 20)));
  const query = (url.searchParams.get("q") ?? "").trim().toLocaleLowerCase();

  const { posts } = await fetchBlogPosts();
  const publicationPosts = posts
    .filter((p) => p.publicationRkey === PUBLIC_LEAFLET_BLOG_PUBLICATION)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const matchingPosts = query
    ? publicationPosts.filter(
        (post) =>
          post.title.toLocaleLowerCase().includes(query) ||
          (post.tags ?? []).some((tag) => normalizeTag(tag).includes(query)),
      )
    : publicationPosts;

  const page = matchingPosts
    .slice(offset, offset + limit)
    .map(({ title, createdAt, publicationRkey, rkey, url, tags }) => ({
      title,
      createdAt,
      publicationRkey,
      rkey,
      url,
      tags: [...new Set((tags || []).map(normalizeTag).filter(Boolean))],
    }));

  return json(
    { posts: page, total: matchingPosts.length },
    {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
      },
    },
  );
};
