import type { RequestHandler } from "@sveltejs/kit";
import type { URL } from "url";
import { dev } from "$app/environment";
import { getProfile } from "$components/profile/profile";
import { formatDate } from "$utils/formatters";
import type { StatusUpdate } from "$components/shared";

export const GET: RequestHandler = async ({ url, fetch }: { url: URL, fetch: typeof globalThis.fetch }) => {
  let baseUrl: string;
  baseUrl = dev ? url.origin : "https://ewancroft.uk";
  try {
    const profileData = await getProfile(fetch);
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
    const sortedUpdates = statusUpdates.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
    const atomXml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Now - ${profileData.displayName || profileData.handle}'s Status Updates</title>
  <subtitle>Short status updates showing what ${profileData.displayName || profileData.handle} is currently doing.</subtitle>
  <link href="${baseUrl}/now" />
  <link href="${baseUrl}/now/atom" rel="self" />
  <updated>${new Date().toISOString()}</updated>
  <id>${baseUrl}/now</id>
  <author>
    <name>${profileData.displayName || profileData.handle}</name>
    <uri>${baseUrl}/now</uri>
  </author>
  ${sortedUpdates
    .map(
      (status) => `
  <entry>
    <title>Status update from ${formatDate(status.createdAt)}</title>
    <link href="${baseUrl}/now#${status.tid}" />
    <id>${did}/uk.ewancroft.now/${status.tid}</id>
    <updated>${status.createdAt.toISOString()}</updated>
    <summary type="html"><![CDATA[${escapeXml(status.text)}]]></summary>
    <content type="html"><![CDATA[${escapeXml(status.text)}]]></content>
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
        "Cache-Control": "max-age=0, s-maxage=600",
      },
    });
  } catch (error) {
    console.error("Error generating Atom feed:", error);
    return new Response(
      `<?xml version="1.0" encoding="utf-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom">\n  <title>Now - Status Updates</title>\n  <subtitle>Short status updates showing what I'm currently doing.</subtitle>\n  <link href="${url.origin}/now" />\n  <link href="${url.origin}/now/atom" rel="self" />\n  <updated>${new Date().toISOString()}</updated>\n  <!-- Error occurred while generating feed entries -->\n</feed>`,
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
