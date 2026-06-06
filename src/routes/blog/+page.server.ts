import type { PageServerLoad } from "./$types";
import type { Config } from "@sveltejs/adapter-vercel";
import { fetchBlogPosts, fetchPublications } from "@ewanc26/atproto";
import {
  PUBLIC_ATPROTO_DID,
  PUBLIC_LEAFLET_BLOG_PUBLICATION,
} from "$env/static/public";

const PAGE_SIZE = 20;

export const config: Config = { maxDuration: 30 };

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
  setHeaders({
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
  });
  const [{ posts }, { publications }] = await Promise.all([
    fetchBlogPosts(PUBLIC_ATPROTO_DID, fetch).catch(() => ({ posts: [] })),
    fetchPublications(PUBLIC_ATPROTO_DID, fetch).catch(() => ({
      publications: [],
    })),
  ]);

  const blogPublication = publications.find(
    (p) => p.rkey === PUBLIC_LEAFLET_BLOG_PUBLICATION,
  );
  const publicationPosts = posts
    .filter((p) => p.publicationRkey === PUBLIC_LEAFLET_BLOG_PUBLICATION)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  // Group by year > month
  const grouped = new Map<number, Map<number, typeof publicationPosts>>();

  for (const post of publicationPosts) {
    const date = new Date(post.createdAt);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    if (!grouped.has(year)) grouped.set(year, new Map());
    const yearMap = grouped.get(year)!;
    if (!yearMap.has(month)) yearMap.set(month, []);
    yearMap.get(month)!.push(post);
  }

  // Flatten for initial page — take first PAGE_SIZE posts across all groups
  const allPostsFlat = publicationPosts.map(
    ({ title, createdAt, publicationRkey, rkey, url, tags }) => ({
      title,
      createdAt,
      publicationRkey,
      rkey,
      url,
      tags: tags ?? [],
    }),
  );

  const initial = allPostsFlat.slice(0, PAGE_SIZE);
  const remaining = allPostsFlat.length - PAGE_SIZE;

  return {
    blog: blogPublication
      ? {
          title: blogPublication.name,
          description: blogPublication.description ?? "",
          url: blogPublication.url,
          rss: `${blogPublication.url}/rss`,
        }
      : null,
    posts: initial,
    total: allPostsFlat.length,
    hasMore: remaining > 0,
    pageSize: PAGE_SIZE,
  };
};
