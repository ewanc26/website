import { fetchBlogPosts } from "$lib/services/atproto/fetch";
import { PUBLIC_LEAFLET_BLOG_PUBLICATION } from "$env/static/public";
import { blogDateParts } from "$lib/utils/date";
import { normalizeSlug } from "$lib/utils/slugify";

export interface IndexedPost {
  title: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  path: string;
  tags: string[];
}

export async function getIndexedPosts(): Promise<IndexedPost[]> {
  const { posts } = await fetchBlogPosts().catch(() => ({ posts: [] }));
  return posts
    .filter((p) => p.publicationRkey === PUBLIC_LEAFLET_BLOG_PUBLICATION)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .map((p) => {
      const { year, month, day } = blogDateParts(p.createdAt);
      return {
        title: p.title,
        description: p.description,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        path: `/blog/${year}/${month}/${day}/${normalizeSlug(p.title)}`,
        tags: p.tags ?? [],
      };
    });
}

export const xmlEscape = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
