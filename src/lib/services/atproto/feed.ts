/**
 * Recent Bluesky posts — top-level only (replies excluded; a feed of
 * "reply to so-and-so" out of context isn't representative). Bounded to a
 * handful of pages so a quiet stretch of nothing-but-replies can't force
 * a long pagination walk at request time.
 */

import { getPDSAgent } from "@ewanc26/atproto";
import { getCache, setCache } from "$lib/utils/cache";

export interface FeedPost {
  uri: string;
  rkey: string;
  text: string;
  createdAt: string;
}

const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes — posts move fast
const MAX_PAGES = 5;
const PAGE_SIZE = 50;

export async function fetchRecentPosts(
  did: string,
  fetchFn: typeof fetch = fetch,
  want = 6,
): Promise<FeedPost[]> {
  const cacheKey = `recent-posts:${did}:${want}`;
  const cached = getCache<FeedPost[]>(cacheKey);
  if (cached) return cached;

  const agent = await getPDSAgent(did, fetchFn);
  const posts: FeedPost[] = [];
  let cursor: string | undefined;

  for (let page = 0; page < MAX_PAGES && posts.length < want; page++) {
    const resp = await agent.com.atproto.repo.listRecords({
      repo: did,
      collection: "app.bsky.feed.post",
      limit: PAGE_SIZE,
      cursor,
      reverse: false,
    });
    for (const { uri, value } of resp.data.records) {
      const v = value as { text?: string; reply?: unknown; createdAt?: string };
      if (v.reply || !v.text?.trim()) continue;
      posts.push({
        uri,
        rkey: uri.split("/").pop() ?? "",
        text: v.text.trim(),
        createdAt: v.createdAt ?? "",
      });
      if (posts.length >= want) break;
    }
    cursor = resp.data.cursor;
    if (!cursor) break;
  }

  setCache(cacheKey, posts, CACHE_TTL_MS);
  return posts;
}
