import type { RequestHandler } from "./$types";
import { dev } from "$app/environment";
import { getProfile } from "$lib/components/profile/profile";

// Define a type for status updates based on the lexicon
interface StatusUpdate {
  text: string;
  createdAt: Date;
  tid: string; // The record key
}

export const GET: RequestHandler = async ({ url, fetch }) => {
  try {
    // Use getProfile to get profile data
    const profileData = await getProfile();

    const did = profileData.did;
    const pdsUrl = profileData.pds;

    if (!pdsUrl) throw new Error("Could not find PDS URL");

    // Get status updates
    const statusResponse = await fetch(
      `${pdsUrl}/xrpc/com.atproto.repo.listRecords?repo=${did}&collection=uk.ewancroft.now`
    );
    if (!statusResponse.ok)
      throw new Error(`Status fetch failed: ${statusResponse.status}`);
    const statusData = await statusResponse.json();

    // Process status updates
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

    // Sort status updates by date (newest first)
    const sortedUpdates = statusUpdates.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    // Format date for titles
    const formatDate = (date: Date): string => {
      return date.toLocaleString('en-GB', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };

    // Build the RSS XML
    const baseUrl = dev ? url.origin : "https://ewancroft.uk"; // Update with your production domain
    const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
  <title>Now - ${profileData.displayName || profileData.handle}'s Status Updates</title>
  <description>Short status updates showing what ${profileData.displayName || profileData.handle} is currently doing.</description>
  <link>${baseUrl}/now</link>
  <atom:link href="${baseUrl}/now/rss.xml" rel="self" type="application/rss+xml" />
  <image>
    <url>${baseUrl}/embed/now.png</url>
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
        "Cache-Control": "max-age=0, s-maxage=600", // Reduced cache time to 10 minutes
      },
    });
  } catch (error) {
    console.error("Error generating status RSS feed:", error);

    // Return a minimal valid RSS feed in case of error
    return new Response(
      `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Now - Status Updates</title>
  <description>Short status updates showing what I'm currently doing.</description>
  <link>${url.origin}/now</link>
  <atom:link href="${url.origin}/now/rss.xml" rel="self" type="application/rss+xml" />
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <!-- Error occurred while generating feed items -->
</channel>
</rss>`,
      {
        headers: {
          "Content-Type": "application/xml",
          "Cache-Control": "no-cache",
        },
      }
    );
  }
};

// Helper function to escape XML special characters
function escapeXml(unsafe: string): string {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}