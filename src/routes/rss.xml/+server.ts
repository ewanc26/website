import { getIndexedPosts, xmlEscape } from "$lib/server/blogIndex";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url }) => {
  const origin = url.origin;
  const posts = (await getIndexedPosts()).slice(0, 30);
  const items = posts
    .map((p) => {
      const link = `${origin}${p.path}`;
      return `    <item>
      <title>${xmlEscape(p.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(p.createdAt).toUTCString()}</pubDate>${p.description ? `\n      <description>${xmlEscape(p.description)}</description>` : ""}${p.tags.map((t) => `\n      <category>${xmlEscape(t)}</category>`).join("")}
    </item>`;
    })
    .join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Ewan's Corner</title>
    <link>${origin}/blog</link>
    <description>Writing on technology, tradition, and the AT Protocol.</description>
    <language>en-GB</language>
    <atom:link href="${origin}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
  return new Response(body, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, s-maxage=600, stale-while-revalidate=3600",
    },
  });
};
