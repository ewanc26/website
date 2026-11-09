import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

// Hardcoded DID for Ewan's repository
const DID = "did:plc:ofrbh253gwicbkc5nktqepol";

/**
 * Fetch repository events from the AT Protocol
 * Returns a stream of events from various collections in the repository
 */
export const GET: RequestHandler = async ({ fetch, url, setHeaders }) => {
  setHeaders({
    "cache-control": "public, s-maxage=5, stale-while-revalidate=15",
    "content-type": "application/json",
  });

  const cursor = url.searchParams.get("cursor");
  const limit = Math.min(
    100,
    Math.max(1, parseInt(url.searchParams.get("limit") ?? "50", 10)),
  );

  try {
    // Fetch events from ALL collections dynamically
    const allEvents: Array<{
      collection: string;
      uri: string;
      cid: string;
      createdAt: string;
      author: string;
      record: any;
    }> = [];

    // List of collections to fetch from
    const collections = [
      "app.bsky.feed.post",
      "app.bsky.feed.like",
      "app.bsky.feed.repost",
      "app.bsky.graph.follow",
      "pub.leaflet.comment",
      "site.standard.document",
      "fm.teal.feed.play",
    ];

    for (const collection of collections) {
      try {
        const params = new URLSearchParams({
          repo: DID,
          collection,
          limit: String(limit),
        });
        if (cursor) params.set("cursor", cursor);

        const response = await fetch(
          `https://eurosky.social/xrpc/com.atproto.repo.listRecords?${params}`,
          {
            headers: {
              Accept: "application/json",
            },
          },
        );

        if (!response.ok) continue;

        const data = await response.json();
        if (data.records) {
          for (const record of data.records) {
            allEvents.push({
              collection,
              uri: record.uri,
              cid: record.cid,
              createdAt: record.value?.createdAt || new Date().toISOString(),
              author: DID,
              record: record.value,
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching collection ${collection}:`, error);
        continue;
      }
    }

    // Sort by date, most recent first
    allEvents.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return json({
      events: allEvents.slice(0, limit),
      cursor: allEvents.length > limit ? allEvents[limit - 1]?.cid : null,
    });
  } catch (error) {
    console.error("Error fetching repository events:", error);
    return json(
      {
        events: [],
        cursor: null,
        error: "Failed to fetch repository events",
      },
      { status: 500 },
    );
  }
};
