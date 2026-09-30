import type { APIRoute } from "astro";
import { getIndexedPosts } from "$lib/server/blogIndex";

const STATIC = [
  "/",
  "/about",
  "/about/name",
  "/blog",
  "/support",
  "/subscriptions",
  "/site",
];

export const GET: APIRoute = async ({ url }) => {
  const origin = url.origin;
  const posts = await getIndexedPosts();
  const entries = [
    ...STATIC.map((p) => `  <url><loc>${origin}${p}</loc></url>`),
    ...posts.map(
      (p) =>
        `  <url><loc>${origin}${p.path}</loc><lastmod>${new Date(p.updatedAt ?? p.createdAt).toISOString().slice(0, 10)}</lastmod></url>`,
    ),
  ].join("\n");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`,
    {
      headers: {
        "content-type": "application/xml; charset=utf-8",
        "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
};
