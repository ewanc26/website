/**
 * AT Protocol data fetching layer.
 *
 * Thin wrappers around @ewanc26/atproto library calls plus heavier
 * fetch functions for subscriptions, comments, and recommendations
 * that stitch together DID resolution, PDS queries, and Constellation
 * backlinks.
 *
 * All fetch functions accept an optional `fetch` override so SvelteKit's
 * server-side request context (cookies, caching) is respected.
 */

import { PUBLIC_ATPROTO_DID } from "$env/static/public";
import { mapWithConcurrency } from "$lib/utils/promise";
import {
  fetchKibunStatus as _fetchKibunStatus,
  fetchBlogPosts as _fetchBlogPosts,
  fetchProfile as _fetchProfile,
  fetchDocuments as _fetchDocuments,
  fetchPublications as _fetchPublications,
  fetchSiteInfo as _fetchSiteInfo,
} from "@ewanc26/atproto";
import { resolveDid } from "./did";
import { getPDSAgent } from "./agents";
import { getCache, setCache } from "$lib/utils/cache";

// ── Simple wrappers (delegate to @ewanc26/atproto) ──────

const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes

export async function fetchKibunStatus(fetchFn?: typeof fetch) {
  return _fetchKibunStatus(PUBLIC_ATPROTO_DID, fetchFn);
}

export async function fetchBlogPosts(fetchFn?: typeof fetch) {
  return _fetchBlogPosts(PUBLIC_ATPROTO_DID, fetchFn);
}

export async function fetchProfile(fetchFn?: typeof fetch) {
  return _fetchProfile(PUBLIC_ATPROTO_DID, fetchFn);
}

export async function fetchDocuments(fetchFn?: typeof fetch) {
  return _fetchDocuments(PUBLIC_ATPROTO_DID, fetchFn);
}

export async function fetchPublications(fetchFn?: typeof fetch) {
  return _fetchPublications(PUBLIC_ATPROTO_DID, fetchFn);
}

export async function fetchSiteInfo(fetchFn?: typeof fetch) {
  return _fetchSiteInfo(PUBLIC_ATPROTO_DID, fetchFn);
}

// ── Subscriptions & Recommendations ────────────────────

export interface SubscriptionPublication {
  uri: string;
  name: string;
  url: string;
  description?: string;
  authorDid: string;
  authorHandle: string;
  authorDisplayName?: string;
}

export async function fetchSubscriptions(
  fetchFn: typeof fetch = fetch,
): Promise<SubscriptionPublication[]> {
  const cacheKey = "subscriptions";
  const cached = getCache<SubscriptionPublication[]>(cacheKey);
  if (cached) return cached;

  const agent = await getPDSAgent(PUBLIC_ATPROTO_DID, fetchFn);
  const allRecords: { uri: string; value: { publication: string } }[] = [];
  let cursor: string | undefined;

  do {
    const resp = await agent.com.atproto.repo.listRecords({
      repo: PUBLIC_ATPROTO_DID,
      collection: "site.standard.graph.subscription",
      limit: 100,
      cursor,
    });
    allRecords.push(
      ...resp.data.records.map((r: any) => ({
        uri: r.uri,
        value: r.value as { publication: string },
      })),
    );
    cursor = resp.data.cursor;
  } while (cursor);

  const resolved = await mapWithConcurrency(
    allRecords,
    async (record): Promise<SubscriptionPublication> => {
      const pubUri = record.value.publication;
      const parts = pubUri.replace("at://", "").split("/");
      const did = parts[0];
      const rkey = parts[parts.length - 1];

      const didDoc = await resolveDid(did, fetchFn);
      const pdsUrl = didDoc.service?.[0]?.serviceEndpoint;
      if (!pdsUrl) throw new Error(`No PDS for ${did}`);

      const handleEntry: string | undefined = didDoc.alsoKnownAs?.find(
        (a: string) => a.startsWith("at://"),
      );
      const authorHandle = handleEntry ? handleEntry.replace("at://", "") : did;

      const pubRes = await fetchFn(
        `${pdsUrl}/xrpc/com.atproto.repo.getRecord?repo=${encodeURIComponent(did)}&collection=site.standard.publication&rkey=${rkey}`,
      );
      if (!pubRes.ok) throw new Error(`Publication not found: ${pubUri}`);
      const pubData = await pubRes.json();
      const value = pubData.value;

      let authorDisplayName: string | undefined;
      try {
        const profileRes = await fetchFn(
          `${pdsUrl}/xrpc/com.atproto.repo.getRecord?repo=${encodeURIComponent(did)}&collection=app.bsky.actor.profile&rkey=self`,
        );
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          authorDisplayName = profileData.value?.displayName;
        }
      } catch {}

      return {
        uri: pubUri,
        name: value.name ?? "Unknown",
        url: value.url ?? "#",
        description: value.description,
        authorDid: did,
        authorHandle,
        authorDisplayName,
      };
    },
    5,
  );

  const data = resolved
    .filter(
      (r): r is PromiseFulfilledResult<SubscriptionPublication> =>
        r.status === "fulfilled",
    )
    .map((r) => r.value);

  setCache(cacheKey, data, CACHE_TTL_MS);
  return data;
}

export interface RecommendationItem {
  uri: string;
  name: string;
  url: string;
  description?: string;
  authorDid: string;
  authorHandle: string;
}

export async function fetchRecommendations(
  fetchFn: typeof fetch = fetch,
): Promise<RecommendationItem[]> {
  const cacheKey = "recommendations";
  const cached = getCache<RecommendationItem[]>(cacheKey);
  if (cached) return cached;

  const agent = await getPDSAgent(PUBLIC_ATPROTO_DID, fetchFn);
  const allRecords: { uri: string; value: { document: string } }[] = [];
  let cursor: string | undefined;

  do {
    const resp = await agent.com.atproto.repo.listRecords({
      repo: PUBLIC_ATPROTO_DID,
      collection: "site.standard.graph.recommend",
      limit: 100,
      cursor,
    });
    allRecords.push(
      ...resp.data.records.map((r: any) => ({
        uri: r.uri,
        value: r.value as { document: string },
      })),
    );
    cursor = resp.data.cursor;
  } while (cursor);

  const resolved = await mapWithConcurrency(
    allRecords,
    async (record): Promise<RecommendationItem> => {
      const docUri = record.value.document;
      const parts = docUri.replace("at://", "").split("/");
      const did = parts[0];
      const rkey = parts[parts.length - 1];

      const didDoc = await resolveDid(did, fetchFn);
      const pdsUrl = didDoc.service?.[0]?.serviceEndpoint;
      if (!pdsUrl) throw new Error(`No PDS for ${did}`);

      const handleEntry: string | undefined = didDoc.alsoKnownAs?.find(
        (a: string) => a.startsWith("at://"),
      );
      const authorHandle = handleEntry ? handleEntry.replace("at://", "") : did;

      const docRes = await fetchFn(
        `${pdsUrl}/xrpc/com.atproto.repo.getRecord?repo=${encodeURIComponent(did)}&collection=site.standard.document&rkey=${rkey}`,
      );
      if (!docRes.ok) throw new Error(`Document not found: ${docUri}`);
      const docData = await docRes.json();
      const value = docData.value;

      return {
        uri: docUri,
        name: value.title ?? "Unknown",
        url: value.url ?? "#",
        description: value.description,
        authorDid: did,
        authorHandle,
      };
    },
    5,
  );

  const data = resolved
    .filter(
      (r): r is PromiseFulfilledResult<RecommendationItem> =>
        r.status === "fulfilled",
    )
    .map((r) => r.value);

  setCache(cacheKey, data, CACHE_TTL_MS);
  return data;
}

// ── Comments ──────────────────────────────────────────

export interface LeafletComment {
  uri: string;
  plaintext: string;
  createdAt: string;
  authorDid: string;
  authorHandle: string;
  authorDisplayName?: string;
  reply?: { parent: string };
}

export interface AtBacklink {
  uri: string;
  collection: string;
  text: string;
  createdAt?: string;
  authorDid: string;
  authorHandle: string;
  authorDisplayName?: string;
  authorAvatarUrl?: string;
  url: string;
}

const CONSTELLATION = "https://constellation.microcosm.blue";
const SLINGSHOT = "https://slingshot.microcosm.blue";
const CONSTELLATION_HEADERS = {
  Accept: "application/json",
  "User-Agent": "ewancroft.uk/12.2 (https://ewancroft.uk)",
};

interface BacklinkRef {
  did: string;
  collection: string;
  rkey: string;
}

interface BacklinkSources {
  links?: Record<string, Record<string, unknown>>;
}

/**
 * Ask Constellation which record fields actually link to a subject, then page
 * through those exact sources. This avoids baking in one lexicon/path pair and
 * keeps working when a document is linked through a rich embed rather than a
 * plain URI field.
 */
async function fetchBacklinkRefs(
  subjects: string[],
  fetchFn: typeof fetch,
  collections?: Set<string>,
): Promise<BacklinkRef[]> {
  const refs = new Map<string, BacklinkRef>();

  await Promise.all(
    [...new Set(subjects.filter(Boolean))].map(async (subject) => {
      const sourcesUrl = new URL(`${CONSTELLATION}/links/all`);
      sourcesUrl.searchParams.set("target", subject);

      let sources: BacklinkSources;
      try {
        const response = await fetchFn(sourcesUrl, {
          headers: CONSTELLATION_HEADERS,
        });
        if (!response.ok) return;
        sources = await response.json();
      } catch {
        return;
      }

      const matchingSources = Object.entries(sources.links ?? {}).flatMap(
        ([collection, paths]) => {
          if (collections && !collections.has(collection)) return [];
          return Object.keys(paths ?? {}).map((rawPath) => ({
            collection,
            rawPath,
          }));
        },
      );

      await Promise.all(
        matchingSources.map(async ({ collection, rawPath }) => {
          // /links/all uses the JSON-path spelling (`.subject`), while the XRPC
          // source parameter expects it without the leading dot (`subject`).
          const path = rawPath.startsWith(".") ? rawPath.slice(1) : rawPath;
          const source = `${collection}:${path}`;
          let cursor: string | undefined;

          do {
            const backlinksUrl = new URL(
              `${CONSTELLATION}/xrpc/blue.microcosm.links.getBacklinks`,
            );
            backlinksUrl.searchParams.set("subject", subject);
            backlinksUrl.searchParams.set("source", source);
            backlinksUrl.searchParams.set("limit", "100");
            backlinksUrl.searchParams.set("reverse", "true");
            if (cursor) backlinksUrl.searchParams.set("cursor", cursor);

            try {
              const response = await fetchFn(backlinksUrl, {
                headers: CONSTELLATION_HEADERS,
              });
              if (!response.ok) break;
              const page = await response.json();
              for (const record of page.records ?? []) {
                if (!record.did || !record.rkey) continue;
                const ref = {
                  did: record.did,
                  collection: record.collection ?? collection,
                  rkey: record.rkey,
                };
                refs.set(`${ref.did}/${ref.collection}/${ref.rkey}`, ref);
              }
              cursor =
                typeof page.cursor === "string" ? page.cursor : undefined;
            } catch {
              break;
            }
          } while (cursor && refs.size < 500);
        }),
      );
    }),
  );

  return [...refs.values()];
}

async function resolveBacklinkAuthor(did: string, fetchFn: typeof fetch) {
  let authorHandle = did;
  let authorDisplayName: string | undefined;
  let authorAvatarUrl: string | undefined;

  try {
    const profile = await _fetchProfile(did, fetchFn);
    authorHandle = profile.handle || did;
    authorDisplayName = profile.displayName || undefined;
    authorAvatarUrl = profile.avatar || undefined;
  } catch {
    try {
      const didDoc = await resolveDid(did, fetchFn);
      const handleEntry: string | undefined = didDoc.alsoKnownAs?.find(
        (entry: string) => entry.startsWith("at://"),
      );
      authorHandle = handleEntry?.replace("at://", "") ?? did;
    } catch {}
  }

  return { authorHandle, authorDisplayName, authorAvatarUrl };
}

export async function fetchBacklinks(
  subjects: string[],
  fetchFn: typeof fetch = fetch,
): Promise<AtBacklink[]> {
  // Constellation indexes URI strings exactly. Check the common slash/no-slash
  // spellings so a link to either the local permalink or the publication's
  // canonical URL is not missed merely because an editor normalised it.
  const subjectVariants = subjects.flatMap((subject) => {
    if (!subject?.startsWith("http")) return subject ? [subject] : [];
    try {
      const parsed = new URL(subject);
      parsed.search = "";
      parsed.hash = "";
      const withoutSlash = parsed.href.replace(/\/$/, "");
      return [withoutSlash, `${withoutSlash}/`];
    } catch {
      return [subject];
    }
  });
  const uniqueSubjects = [...new Set(subjectVariants)].sort();
  const cacheKey = `backlinks:${uniqueSubjects.join("|")}`;
  const cached = getCache<AtBacklink[]>(cacheKey);
  if (cached) return cached;

  // These collections carry human-authored backlink content that can be
  // rendered meaningfully. Read receipts, likes, and other relationship
  // records remain discoverable in Constellation but are not "mentions".
  const refs = await fetchBacklinkRefs(
    uniqueSubjects,
    fetchFn,
    new Set(["app.bsky.feed.post", "site.standard.document"]),
  );

  const resolved = await mapWithConcurrency(
    refs,
    async (ref): Promise<AtBacklink> => {
      const recordRes = await fetchFn(
        `${SLINGSHOT}/xrpc/com.atproto.repo.getRecord?repo=${encodeURIComponent(ref.did)}&collection=${encodeURIComponent(ref.collection)}&rkey=${encodeURIComponent(ref.rkey)}`,
        { headers: { Accept: "application/json" } },
      );
      if (!recordRes.ok) throw new Error(`Backlink not found: ${ref.rkey}`);
      const recordData = await recordRes.json();
      const value = recordData.value ?? {};
      const { authorHandle, authorDisplayName, authorAvatarUrl } =
        await resolveBacklinkAuthor(ref.did, fetchFn);
      const uri = `at://${ref.did}/${ref.collection}/${ref.rkey}`;

      let url = uri;
      if (ref.collection === "app.bsky.feed.post") {
        url = `https://bsky.app/profile/${authorHandle}/post/${ref.rkey}`;
      } else if (typeof value.site === "string") {
        let base: string | undefined;
        if (value.site.startsWith("at://")) {
          const [siteDid, siteCollection, siteRkey] = value.site
            .slice(5)
            .split("/");
          if (siteDid && siteCollection && siteRkey) {
            try {
              const siteRes = await fetchFn(
                `${SLINGSHOT}/xrpc/com.atproto.repo.getRecord?repo=${encodeURIComponent(siteDid)}&collection=${encodeURIComponent(siteCollection)}&rkey=${encodeURIComponent(siteRkey)}`,
                { headers: { Accept: "application/json" } },
              );
              if (siteRes.ok) {
                const siteRecord = await siteRes.json();
                const siteUrl = siteRecord.value?.url;
                if (typeof siteUrl === "string") {
                  base = siteUrl.startsWith("http")
                    ? siteUrl
                    : `https://${siteUrl}`;
                }
              }
            } catch {}
          }
        } else {
          base = value.site.startsWith("http")
            ? value.site
            : `https://${value.site}`;
        }

        if (base) {
          const path = value.path || `/${ref.rkey}`;
          url = `${base.replace(/\/$/, "")}/${String(path).replace(/^\//, "")}`;
        }
      }

      return {
        uri,
        collection: ref.collection,
        text:
          value.text ?? value.title ?? value.description ?? "Linked this post",
        createdAt: value.createdAt ?? value.publishedAt,
        authorDid: ref.did,
        authorHandle,
        authorDisplayName,
        authorAvatarUrl,
        url,
      };
    },
    5,
  );

  const data = resolved
    .filter(
      (result): result is PromiseFulfilledResult<AtBacklink> =>
        result.status === "fulfilled",
    )
    .map((result) => result.value)
    .sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() -
        new Date(a.createdAt ?? 0).getTime(),
    );

  setCache(cacheKey, data, CACHE_TTL_MS);
  return data;
}

export async function fetchComments(
  subjectUri: string,
  fetchFn: typeof fetch = fetch,
): Promise<LeafletComment[]> {
  const cacheKey = `comments:${subjectUri}`;
  const cached = getCache<LeafletComment[]>(cacheKey);
  if (cached) return cached;

  const commentRefs = await fetchBacklinkRefs(
    [subjectUri],
    fetchFn,
    new Set(["pub.leaflet.comment"]),
  );
  if (!commentRefs.length) return [];

  const comments = await mapWithConcurrency(
    commentRefs,
    async (ref) => {
      const recordRes = await fetchFn(
        `${SLINGSHOT}/xrpc/com.atproto.repo.getRecord?repo=${encodeURIComponent(ref.did)}&collection=pub.leaflet.comment&rkey=${ref.rkey}`,
      );
      if (!recordRes.ok) throw new Error(`Comment not found: ${ref.rkey}`);
      const recordData = await recordRes.json();
      const value = recordData.value;

      const { authorHandle, authorDisplayName } = await resolveBacklinkAuthor(
        ref.did,
        fetchFn,
      );

      return {
        uri: `at://${ref.did}/pub.leaflet.comment/${ref.rkey}`,
        plaintext: value.plaintext ?? "",
        createdAt: value.createdAt,
        authorDid: ref.did,
        authorHandle,
        authorDisplayName,
        reply: value.reply,
      } as LeafletComment;
    },
    5,
  );

  const data = comments
    .filter(
      (r): r is PromiseFulfilledResult<LeafletComment> =>
        r.status === "fulfilled",
    )
    .map((r) => r.value)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

  setCache(cacheKey, data, CACHE_TTL_MS);
  return data;
}

export async function fetchBlob(ref: any) {
  const agent = await getPDSAgent(PUBLIC_ATPROTO_DID);
  const cid = ref.$link || ref.ref?.$link || ref;
  const blob = await agent.com.atproto.sync.getBlob({
    did: PUBLIC_ATPROTO_DID,
    cid,
  });
  return new Uint8Array(blob.data);
}
