import type { RequestHandler } from "./$types";
import { dev } from "$app/environment";
import { getProfile } from "$components/profile/profile";
import { formatDate } from "$utils/formatters";
import type { StatusUpdate } from "$components/shared";
import { escapeXml } from "$lib/utils/xml";

import { TTLCache } from "$utils/cache";

// TTL cache for status updates (5 min)
const STATUS_CACHE_TTL = 5 * 60 * 1000;
const statusCache = new TTLCache<{ profileData: any; sortedUpdates: StatusUpdate[] }>(STATUS_CACHE_TTL);

export const GET: RequestHandler = async ({ url, fetch }: { url: URL, fetch: typeof globalThis.fetch }) => {
  const baseUrl = dev ? url.origin : "https://ewancroft.uk";

  try {
    let cached = statusCache.get();
    let profileData: any;
    let sortedUpdates: StatusUpdate[];

    if (cached) {
      profileData = cached.profileData;
      sortedUpdates = cached.sortedUpdates;
    } else {
      profileData = await getProfile(fetch);
      const did = profileData.did;
      const pdsUrl = profileData.pds;
      if (!pdsUrl) throw new Error("Could not find PDS URL");
      const statusResponse = await fetch(
        `${pdsUrl}/xrpc/com.atproto.repo.listRecords?repo=${did}&collection=uk.ewancroft.now`
      );
      if (!statusResponse.ok)
        throw new Error(`Status fetch failed: ${statusResponse.status}`);
      const statusData = await statusResponse.json();
      const statusUpdates: StatusUpdate[] = [];
      for (const data of statusData.records) {
        const matches = data.uri.split("/");
        const tid = matches[matches.length - 1];
        const record = data.value;
        if (matches && matches.length === 5 && record) {
          statusUpdates.push({
            text: record.text,
            createdAt: new Date(record.createdAt),
            tid,
          });
        }
      }
      sortedUpdates = statusUpdates.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
      statusCache.set({ profileData, sortedUpdates });
    }

    const did = profileData.did;
    const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
  <title>Now - ${profileData.displayName || profileData.handle}'s Status Updates</title>
  <description>Short status updates showing what ${profileData.displayName || profileData.handle} is currently doing.</description>
  <link>${baseUrl}/now</link>
  <atom:link href="${baseUrl}/now/rss" rel="self" type="application/rss+xml" />
  <image>
    <url>${baseUrl}/og/now.png</url>
    <title>Now - ${profileData.displayName || profileData.handle}'s Status Updates</title>
    <link>${baseUrl}/now</link>
  </image>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  ${sortedUpdates
    .map(
      (status) => `
  <item>
    <title>Status update from ${formatDate(status.createdAt)}</title>
    <link>${baseUrl}/now#${status.tid}</link>
    <guid isPermaLink="false">${did}/uk.ewancroft.now/${status.tid}</guid>
    <pubDate>${status.createdAt.toUTCString()}</pubDate>
    <description><![CDATA[${escapeXml(status.text)}]]></description>
    <content:encoded><![CDATA[${escapeXml(status.text)}]]></content:encoded>
    <author>${profileData.displayName || profileData.handle} (${profileData.handle})</author>
  </item>`
    )
    .join("")}
</channel>
</rss>`;

    return new Response(rssXml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "max-age=0, s-maxage=600",
      },
    });
  } catch (error) {
    console.error("Error generating status RSS feed:", error);

    return new Response(
      `<?xml version="1.0" encoding="UTF-8" ?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n  <title>Now - Status Updates</title>\n  <description>Short status updates showing what I'm currently doing.</description>\n  <link>${url.origin}/now</link>\n  <atom:link href="${url.origin}/now" rel="self" type="application/rss+xml" />\n  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n</channel>\n</rss>`,
      {
        headers: {
          "Content-Type": "application/xml",
          "Cache-Control": "no-cache",
        },
      }
    );
  }
};