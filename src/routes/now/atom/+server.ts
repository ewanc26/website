import type { RequestHandler } from "@sveltejs/kit";
import type { URL } from "url";
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

    const atomXml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Now - ${profileData.displayName || profileData.handle}'s Status Updates</title>
  <subtitle>Short status updates showing what ${profileData.displayName || profileData.handle} is currently doing.</subtitle>
  <link href="${baseUrl}/now" />
  <link href="${baseUrl}/now/atom" rel="self" type="application/atom+xml" />
  <updated>${sortedUpdates.length > 0 ? sortedUpdates[0].createdAt.toISOString() : new Date().toISOString()}</updated>
  <id>${baseUrl}/now</id>
  <author>
    <n>${profileData.displayName || profileData.handle}</n>
    <uri>${baseUrl}/now</uri>
  </author>
  <icon>${baseUrl}/api/og/now.png</icon>
  <logo>${baseUrl}/api/og/now.png</logo>
  ${sortedUpdates
    .map(
      (status) => `
  <entry>
    <title>Status update from ${formatDate(status.createdAt)}</title>
    <link href="${baseUrl}/now#${status.tid}" rel="alternate" type="text/html" />
    <id>${baseUrl}/now/${status.tid}</id>
    <updated>${status.createdAt.toISOString()}</updated>
    <published>${status.createdAt.toISOString()}</published>
    <summary type="text">${escapeXml(status.text)}</summary>
    <content type="text">${escapeXml(status.text)}</content>
    <author>
      <n>${profileData.displayName || profileData.handle}</n>
      <uri>https://bsky.app/profile/${profileData.handle}</uri>
    </author>
  </entry>`
    )
    .join("")}
</feed>`;

    return new Response(atomXml, {
      headers: {
        "Content-Type": "application/atom+xml; charset=utf-8",
        "Cache-Control": "max-age=0, s-maxage=600",
      },
    });
  } catch (error) {
    console.error("Error generating Atom feed:", error);
    return new Response(
      `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Now - Status Updates</title>
  <subtitle>Short status updates showing what I'm currently doing.</subtitle>
  <link href="${baseUrl}/now" />
  <link href="${baseUrl}/now/atom" rel="self" type="application/atom+xml" />
  <updated>${new Date().toISOString()}</updated>
  <id>${baseUrl}/now</id>
  <author>
    <n>Ewan's Corner</n>
    <uri>${baseUrl}/now</uri>
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