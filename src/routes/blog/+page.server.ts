/**
 * Blog index server load.
 *
 * Groups posts by year → month and returns an initial page for client-side
 * pagination. Uses a flat slice for the first load so the initial render
 * is fast regardless of the total post count.
 */

import type { PageServerLoad } from "./$types";
import type { Config } from "@sveltejs/adapter-vercel";
import { fetchBlogPosts, fetchPublications } from "@ewanc26/atproto";
import {
  PUBLIC_ATPROTO_DID,
  PUBLIC_LEAFLET_BLOG_PUBLICATION,
} from "$env/static/public";
import { blogDateParts } from "$lib/utils/date";

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

  // Build archive and topic summaries from the same AT Protocol publication records.
  const archive = new Map<number, Map<number, number>>();
  const topicCounts = new Map<string, number>();

  for (const post of publicationPosts) {
    const { year, month } = blogDateParts(post.createdAt);
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);

    if (!archive.has(yearNum)) archive.set(yearNum, new Map());
    const yearMap = archive.get(yearNum)!;
    yearMap.set(monthNum, (yearMap.get(monthNum) ?? 0) + 1);

    for (const tag of post.tags ?? []) {
      topicCounts.set(tag, (topicCounts.get(tag) ?? 0) + 1);
    }
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
    topics: Array.from(topicCounts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count })),
    archive: Array.from(archive.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([year, months]) => ({
        year,
        months: Array.from(months.entries())
          .sort((a, b) => b[0] - a[0])
          .map(([month, count]) => ({ month, count })),
      })),
  };
};
