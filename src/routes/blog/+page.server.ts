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
  const topicCounts = new Map<string, number>();
  const topicPosts = new Map<string, Set<string>>();

  for (const post of publicationPosts) {
    const { year, month } = blogDateParts(post.createdAt);
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);

    if (!archive.has(yearNum)) archive.set(yearNum, new Map());
    const yearMap = archive.get(yearNum)!;
    yearMap.set(monthNum, (yearMap.get(monthNum) ?? 0) + 1);

    for (const tag of post.tags ?? []) {
      topicCounts.set(tag, (topicCounts.get(tag) ?? 0) + 1);
      if (!topicPosts.has(tag)) topicPosts.set(tag, new Set());
      topicPosts.get(tag)!.add(post.rkey);
    }
  }

  // Standard.site tags are intentionally flat. Build a presentation-only
  // taxonomy from tag co-occurrence, without changing the source records.
  const topicNames = Array.from(topicCounts.keys());
  const similarity = (a: string, b: string) => {
    const aPosts = topicPosts.get(a)!;
    const bPosts = topicPosts.get(b)!;
    let intersection = 0;
    for (const rkey of aPosts) {
      if (bPosts.has(rkey)) intersection++;
    }
    const union = aPosts.size + bPosts.size - intersection;
    return union === 0 ? 0 : intersection / union;
  };

  const groupedTags = new Set<string>();
  const topicGroups: { name: string; count: number; tags: { name: string; count: number }[] }[] = [];

  for (const root of [...topicNames].sort(
    (a, b) => (topicCounts.get(b)! - topicCounts.get(a)!) || a.localeCompare(b),
  )) {
    if (groupedTags.has(root) || (topicCounts.get(root) ?? 0) < 2) continue;

    const related = topicNames
      .filter((tag) => tag !== root && !groupedTags.has(tag))
      .map((tag) => ({ tag, score: similarity(root, tag) }))
      .filter(({ score }) => score >= 0.2)
      .sort((a, b) => b.score - a.score || a.tag.localeCompare(b.tag))
      .slice(0, 5)
      .map(({ tag }) => tag);

    if (related.length === 0) continue;

    groupedTags.add(root);
    for (const tag of related) groupedTags.add(tag);

    topicGroups.push({
      name: root,
      count: topicCounts.get(root)!,
      tags: [root, ...related].map((name) => ({
        name,
        count: topicCounts.get(name)!,
      })),
    });

    if (topicGroups.length >= 6) break;
  }

  const ungroupedTopics = topicNames
    .filter((name) => !groupedTags.has(name))
    .sort((a, b) => topicCounts.get(b)! - topicCounts.get(a)! || a.localeCompare(b))
    .slice(0, 12)
    .map((name) => ({ name, count: topicCounts.get(name)! }));

  // Flatten for initial page — take first PAGE_SIZE posts across all groups
  const allPostsFlat = publicationPosts.map(
    ({ title, createdAt, publicationRkey, rkey, url, tags, coverImage }) => ({
      title,
      createdAt,
      publicationRkey,
      rkey,
      url,
      tags: tags ?? [],
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
