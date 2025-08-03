import type { RequestHandler } from "../rss/$types";
import { dev } from "$app/environment";
import { parse } from "$lib/parser";
import type { MarkdownPost } from "$components/shared";
import { getProfile } from "$components/profile/profile";

export const GET: RequestHandler = async ({ url, fetch }) => {
  try {
    const profileData = await getProfile(fetch);
    const did = profileData.did;
    const pdsUrl = profileData.pds;
    if (!pdsUrl) throw new Error("Could not find PDS URL");
    const postsResponse = await fetch(
      `${pdsUrl}/xrpc/com.atproto.repo.listRecords?repo=${did}&collection=com.whtwnd.blog.entry`
    );
    if (!postsResponse.ok)
      throw new Error(`Posts fetch failed: ${postsResponse.status}`);
    const postsData = await postsResponse.json();
    const mdposts: Map<string, MarkdownPost> = new Map();
    for (const data of postsData.records) {
      const matches = data.uri.split("/");
      const rkey = matches[matches.length - 1];
      const record = data.value;
      if (
        matches &&
        matches.length === 5 &&
        record &&
        (record.visibility === "public" || !record.visibility)
      ) {
        mdposts.set(rkey, {
          title: record.title,
          createdAt: new Date(record.createdAt),
          mdcontent: record.content,
          rkey,
        });
      }
    }
    const posts = await parse(mdposts);
    const sortedPosts = Array.from(posts.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
    const baseUrl = dev ? url.origin : "https://ewancroft.uk";
    const atomXml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Blog - Ewan's Corner</title>
  <subtitle>A personal blog where I share my thoughts on coding, technology, and life.</subtitle>
  <link href="${baseUrl}/blog" />
  <link href="${baseUrl}/blog/atom" rel="self" />
  <updated>${new Date().toISOString()}</updated>
  <id>${baseUrl}/blog</id>
  <author>
    <name>${profileData.displayName || profileData.handle}</name>
    <uri>${baseUrl}/blog</uri>
  </author>
  ${sortedPosts
    .map(
      (post) => `
  <entry>
    <title>${escapeXml(post.title)}</title>
    <link href="${baseUrl}/blog/${post.rkey}" />
    <id>${baseUrl}/blog/${post.rkey}</id>
    <updated>${post.createdAt.toISOString()}</updated>
    <summary type="html"><![CDATA[${post.excerpt || ""}]]></summary>
    <content type="html"><![CDATA[${post.content || ""}]]></content>
    <author>
      <name>${profileData.displayName || profileData.handle}</name>
    </author>
  </entry>`
    )
    .join("")}
</feed>`;
    return new Response(atomXml, {
      headers: {
        "Content-Type": "application/atom+xml",
        "Cache-Control": "max-age=0, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Error generating Atom feed:", error);
    return new Response(
      `<?xml version="1.0" encoding="utf-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom">\n  <title>Blog - Ewan's Corner</title>\n  <subtitle>A personal blog where I share my thoughts on coding, technology, and life.</subtitle>\n  <link href="${url.origin}/blog" />\n  <link href="${url.origin}/blog/atom" rel="self" />\n  <updated>${new Date().toISOString()}</updated>\n  <!-- Error occurred while generating feed entries -->\n</feed>`,
      {
        headers: {
          "Content-Type": "application/atom+xml",
          "Cache-Control": "no-cache",
        },
      }
    );
  }
};

function escapeXml(unsafe: string): string {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
