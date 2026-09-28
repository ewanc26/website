/**
 * Shipped apps, sourced from `fyi.atstore.listing.detail` — the same
 * records that back the listings on atstore.fyi. These are the site
 * owner's own written App Store-style copy (icon, tagline, description,
 * external URL), distinct from the live GitHub pins: curated for public
 * display rather than "whatever's currently pinned."
 */

import {
  getPDSAgent,
  buildPdsBlobUrl,
  extractCidFromImageObject,
} from "@ewanc26/atproto";
import { resolveDid } from "./did";
import { getCache, setCache } from "$lib/utils/cache";

export interface ShippedApp {
  uri: string;
  name: string;
  tagline?: string;
  description?: string;
  externalUrl: string;
  iconUrl?: string;
  createdAt?: string;
}

const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes

export async function fetchShippedApps(
  did: string,
  fetchFn: typeof fetch = fetch,
): Promise<ShippedApp[]> {
  const cacheKey = `shipped-apps:${did}`;
  const cached = getCache<ShippedApp[]>(cacheKey);
  if (cached) return cached;

  const [agent, doc] = await Promise.all([
    getPDSAgent(did, fetchFn),
    resolveDid(did, fetchFn),
  ]);
  const pds = doc?.service?.[0]?.serviceEndpoint;

  const records: { uri: string; value: any }[] = [];
  let cursor: string | undefined;
  do {
    const resp = await agent.com.atproto.repo.listRecords({
      repo: did,
      collection: "fyi.atstore.listing.detail",
      limit: 100,
      cursor,
    });
    records.push(...resp.data.records);
    cursor = resp.data.cursor;
  } while (cursor);

  const apps: ShippedApp[] = records
    .map(({ uri, value }) => {
      // The agent hands back blob refs as a real CID instance (multiformats),
      // not the plain {$link} object extractCidFromImageObject expects — its
      // JSON.stringify output looks like {$link: "..."} via toJSON(), but
      // property access on .ref.$link is undefined at runtime. .toString()
      // is the CID's own string form and matches $link exactly.
      const iconCid: string | null =
        value.icon?.ref?.toString?.() ?? extractCidFromImageObject(value.icon);
      return {
        uri,
        name: value.name as string,
        tagline: value.tagline as string | undefined,
        description: value.description as string | undefined,
        externalUrl: value.externalUrl as string,
        iconUrl:
          iconCid && typeof pds === "string"
            ? buildPdsBlobUrl(pds, did, iconCid)
            : undefined,
        createdAt: value.createdAt as string | undefined,
      };
    })
    .filter((a) => a.name && a.externalUrl)
    // Newest first, matching the "recent writing" convention elsewhere on the site.
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

  setCache(cacheKey, apps, CACHE_TTL_MS);
  return apps;
}
