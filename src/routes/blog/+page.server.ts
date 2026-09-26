/**
 * Blog index server load.
 *
 * Groups posts by year → month and returns an initial page for client-side
 * pagination. Uses a flat slice for the first load so the initial render
 * is fast regardless of the total post count.
 */

import type { PageServerLoad } from "./$types";
import type { Config } from "@sveltejs/adapter-vercel";
import { buildPdsBlobUrl, fetchDocuments, fetchPublications, resolveIdentity } from "@ewanc26/atproto";
import {
  PUBLIC_ATPROTO_DID,
  PUBLIC_LEAFLET_BLOG_PUBLICATION,
} from "$env/static/public";
import { blogDateParts } from "$lib/utils/date";
import { buildNormalizedTags, buildTagGroups, normalizeTag } from "$lib/utils/tags";

const PAGE_SIZE = 20;

export const config: Config = { maxDuration: 30 };

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
  setHeaders({
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
  });
  const [{ documents }, { publications }] = await Promise.all([
    fetchDocuments(PUBLIC_ATPROTO_DID, fetch).catch(() => ({ documents: [] })),
    fetchPublications(PUBLIC_ATPROTO_DID, fetch).catch(() => ({
      publications: [],
    })),
  ]);

  const blogPublication = publications.find(
    (p) => p.rkey === PUBLIC_LEAFLET_BLOG_PUBLICATION,
  );
  const publicationPosts = documents
    .filter((p) => p.publicationRkey === PUBLIC_LEAFLET_BLOG_PUBLICATION)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const identity = await resolveIdentity(PUBLIC_ATPROTO_DID, fetch).catch(() => null);

  const coverImageUrl = (coverImage: unknown) => {
    if (!identity || !coverImage || typeof coverImage !== "object") return undefined;
    const ref = coverImage as Record<string, unknown>;
    const link = ref.ref;
    const cid =
      typeof link === "string"
        ? link
        : link && typeof link === "object" && "$link" in link
          ? (link as { $link?: unknown }).$link
          : undefined;
    return typeof cid === "string"
      ? buildPdsBlobUrl(identity.pds, PUBLIC_ATPROTO_DID, cid)
      : undefined;
  };

  // Build archive and topic summaries from the same AT Protocol publication records.
  const archive = new Map<number, Map<number, number>>();

  for (const post of publicationPosts) {
    const { year, month } = blogDateParts(post.publishedAt);
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);

    if (!archive.has(yearNum)) archive.set(yearNum, new Map());
    const yearMap = archive.get(yearNum)!;
    yearMap.set(monthNum, (yearMap.get(monthNum) ?? 0) + 1);
  }

  // Standard.site tags are source data, so normalise them only for presentation
  // and search. The records themselves are never rewritten.
  const normalizedTags = buildNormalizedTags(
    publicationPosts.map((post) => ({
      rkey: post.rkey,
      tags: post.tags,
    })),
  );
  const topicGroups = buildTagGroups(normalizedTags);
  const groupedTags = new Set(topicGroups.flatMap((group) => group.tags.map((tag) => tag.name)));

  const ungroupedTopics = [...normalizedTags.values()]
    .filter((tag) => !groupedTags.has(tag.name))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 12)
    .map(({ name, count }) => ({ name, count }));

  // Flatten for initial page — take first PAGE_SIZE posts across all groups
  const allPostsFlat = publicationPosts.map(
    ({ title, publishedAt, publicationRkey, rkey, url, tags, coverImage }) => ({
      title,
      createdAt: publishedAt,
      publicationRkey,
      rkey,
      url,
      tags: [...new Set((tags ?? []).map(normalizeTag).filter(Boolean))],
      coverImage: coverImageUrl(coverImage),
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
    topics: topicGroups,
    ungroupedTopics,
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
