import { TTLCache } from "$utils/cache";
import { escapeXml } from "$lib/utils/xml";

// TTL cache for Atom feed XML (5 min)
const FEED_CACHE_TTL = 5 * 60 * 1000;
const atomFeedCache = new TTLCache<string>(FEED_CACHE_TTL);

import type { RequestHandler } from "../rss/$types";
import { dev } from "$app/environment";
import { loadAllPosts } from "$services/blogService";

export const GET: RequestHandler = async ({ url, fetch }) => {
  // Check cache first
  const cached = atomFeedCache.get();
  if (cached) {
    return new Response(cached, {
      headers: {
        "Content-Type": "application/atom+xml; charset=utf-8",
        "Cache-Control": "max-age=0, s-maxage=3600",
      },
    });
  }
  try {
    const { profile, sortedPosts } = await loadAllPosts(fetch);
    const baseUrl = dev ? url.origin : "https://ewancroft.uk";
    const atomXml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Blog - Ewan's Corner</title>
  <subtitle>A personal blog where I share my thoughts on coding, technology, and life.</subtitle>
  <link href="${baseUrl}/blog" />
  <link href="${baseUrl}/blog/atom" rel="self" type="application/atom+xml" />
  <updated>${sortedPosts.length > 0 ? sortedPosts[0].createdAt.toISOString() : new Date().toISOString()}</updated>
  <id>${baseUrl}/blog</id>
  <author>
    <name>${profile.displayName || profile.handle}</name>
    <uri>${baseUrl}/blog</uri>
  </author>
  <icon>${baseUrl}/og/blog.png</icon>
  <logo>${baseUrl}/og/blog.png</logo>
  ${sortedPosts
    .map(
      (post) => `
  <entry>
    <title>${escapeXml(post.title)}</title>
    <link href="${baseUrl}/blog/${post.rkey}" rel="alternate" type="text/html" />
    <id>${baseUrl}/blog/${post.rkey}</id>
    <updated>${post.createdAt.toISOString()}</updated>
    <published>${post.createdAt.toISOString()}</published>
    <summary type="html"><![CDATA[${post.excerpt || ""}]]></summary>
    <content type="html"><![CDATA[${post.content || ""}]]></content>
    <author>
      <name>${profile.displayName || profile.handle}</name>
      <uri>https://bsky.app/profile/${profile.handle}</uri>
    </author>
    <link href="${baseUrl}/og/blog.png" rel="enclosure" type="image/png" />
  </entry>`
    )
    .join("")}
</feed>`;
    atomFeedCache.set(atomXml);
    return new Response(atomXml, {
      headers: {
        "Content-Type": "application/atom+xml; charset=utf-8",
        "Cache-Control": "max-age=0, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Error generating Atom feed:", error);
    const baseUrl = dev ? url.origin : "https://ewancroft.uk";
    return new Response(
      `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Blog - Ewan's Corner</title>
  <subtitle>A personal blog where I share my thoughts on coding, technology, and life.</subtitle>
  <link href="${baseUrl}/blog" />
  <link href="${baseUrl}/blog/atom" rel="self" type="application/atom+xml" />
  <updated>${new Date().toISOString()}</updated>
  <id>${baseUrl}/blog</id>
  <author>
    <name>Ewan's Corner</name>
    <uri>${baseUrl}/blog</uri>
  </author>
  <!-- Error occurred while generating feed entries -->
</feed>`,
      {
        headers: {
          "Content-Type": "application/atom+xml; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      }
    );
  }
};
