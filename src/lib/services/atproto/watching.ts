/**
 * "What I'm watching" — sourced from `social.popfeed.feed.review`, Popfeed's
 * film/TV review lexicon. Poster/backdrop URLs come pre-resolved as plain
 * https:// links on the record (unlike the atstore icons), so no blob CID
 * handling is needed here.
 */

import { getPDSAgent } from "@ewanc26/atproto";
import { getCache, setCache } from "$lib/utils/cache";

export interface WatchingEntry {
  uri: string;
  title: string;
  rating?: number;
  genres: string[];
  posterUrl?: string;
  creativeWorkType?: string;
  releaseDate?: string;
  /** For linking out — Popfeed itself has no known public per-review URL. */
  imdbId?: string;
  createdAt: string;
}

const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes

export async function fetchWatching(
  did: string,
  fetchFn: typeof fetch = fetch,
): Promise<WatchingEntry[]> {
  const cacheKey = `watching:${did}`;
  const cached = getCache<WatchingEntry[]>(cacheKey);
  if (cached) return cached;

  const agent = await getPDSAgent(did, fetchFn);
  const records: { uri: string; value: any }[] = [];
  let cursor: string | undefined;
  do {
    const resp = await agent.com.atproto.repo.listRecords({
      repo: did,
      collection: "social.popfeed.feed.review",
      limit: 100,
      cursor,
    });
    records.push(...resp.data.records);
    cursor = resp.data.cursor;
  } while (cursor);

  const entries: WatchingEntry[] = records
    .map(({ uri, value }) => ({
      uri,
      title: value.title as string,
      rating: typeof value.rating === "number" ? value.rating : undefined,
      genres: Array.isArray(value.genres) ? (value.genres as string[]) : [],
      posterUrl: value.posterUrl as string | undefined,
      creativeWorkType: value.creativeWorkType as string | undefined,
      releaseDate: value.releaseDate as string | undefined,
      imdbId: value.identifiers?.imdbId as string | undefined,
      createdAt: (value.createdAt as string) ?? "",
    }))
    .filter((e) => e.title)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  setCache(cacheKey, entries, CACHE_TTL_MS);
  return entries;
}
