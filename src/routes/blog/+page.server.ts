import { fetchDocuments, fetchPublications } from "@ewanc26/atproto";
import { PUBLIC_ATPROTO_DID, PUBLIC_LEAFLET_BLOG_PUBLICATION } from "$env/static/public";
import { blogDateParts } from "$lib/utils/date";
import { normalizeSlug } from "$lib/utils/slugify";
import { normalizeTag } from "$lib/utils/tags";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
  setHeaders({ "cache-control": "public, s-maxage=60, stale-while-revalidate=300" });

  const [{ documents }, { publications }] = await Promise.all([
    fetchDocuments(PUBLIC_ATPROTO_DID, fetch).catch(() => ({ documents: [] })),
    fetchPublications(PUBLIC_ATPROTO_DID, fetch).catch(() => ({ publications: [] })),
  ]);
  const blog = publications.find((p) => p.rkey === PUBLIC_LEAFLET_BLOG_PUBLICATION);
  const posts = documents
    .filter((d) => d.publicationRkey === PUBLIC_LEAFLET_BLOG_PUBLICATION)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .map((d) => {
      const { year, month, day } = blogDateParts(d.publishedAt);
      return {
        title: d.title,
        date: d.publishedAt,
        year,
        tags: [...new Set((d.tags ?? []).map(normalizeTag).filter(Boolean))] as string[],
        href: `/blog/${year}/${month}/${day}/${normalizeSlug(d.title)}`,
      };
    });

  const tagCounts = new Map<string, number>();
  for (const p of posts) for (const t of p.tags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
  const topics = [...tagCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 16);

  return { blog, posts, topics };
};
