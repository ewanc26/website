import { PUBLIC_ATPROTO_DID } from "$env/static/public";
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

  const resolved = await Promise.allSettled(
    allRecords.map(async (record): Promise<SubscriptionPublication> => {
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
    }),
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

  const resolved = await Promise.allSettled(
    allRecords.map(async (record): Promise<RecommendationItem> => {
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
    }),
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

export interface LeafletComment {
  uri: string;
  plaintext: string;
  createdAt: string;
  authorDid: string;
  authorHandle: string;
  authorDisplayName?: string;
  reply?: { parent: string };
}

const CONSTELLATION = "https://constellation.microcosm.blue";
const SLINGSHOT = "https://slingshot.microcosm.blue";

export async function fetchComments(
  subjectUri: string,
  fetchFn: typeof fetch = fetch,
): Promise<LeafletComment[]> {
  const cacheKey = `comments:${subjectUri}`;
  const cached = getCache<LeafletComment[]>(cacheKey);
  if (cached) return cached;

  const backlinksRes = await fetchFn(
    `${CONSTELLATION}/xrpc/blue.microcosm.links.getBacklinks?subject=${encodeURIComponent(subjectUri)}&source=pub.leaflet.comment:subject&limit=100`,
  );
  if (!backlinksRes.ok) return [];
  const backlinks = await backlinksRes.json();

  if (!backlinks.records?.length) return [];

  const comments = await Promise.allSettled(
    backlinks.records.map(async (ref: { did: string; rkey: string }) => {
      const recordRes = await fetchFn(
        `${SLINGSHOT}/xrpc/com.atproto.repo.getRecord?repo=${encodeURIComponent(ref.did)}&collection=pub.leaflet.comment&rkey=${ref.rkey}`,
      );
      if (!recordRes.ok) throw new Error(`Comment not found: ${ref.rkey}`);
      const recordData = await recordRes.json();
      const value = recordData.value;

      const didDoc = await resolveDid(ref.did, fetchFn);
      let authorHandle = ref.did;
      let authorDisplayName: string | undefined;

      if (didDoc) {
        const handleEntry: string | undefined = didDoc.alsoKnownAs?.find(
          (a: string) => a.startsWith("at://"),
        );
        authorHandle = handleEntry ? handleEntry.replace("at://", "") : ref.did;

        const pdsUrl = didDoc.service?.[0]?.serviceEndpoint;
        if (pdsUrl) {
          try {
            const profileRes = await fetchFn(
              `${pdsUrl}/xrpc/com.atproto.repo.getRecord?repo=${encodeURIComponent(ref.did)}&collection=app.bsky.actor.profile&rkey=self`,
            );
            if (profileRes.ok) {
              const profileData = await profileRes.json();
              authorDisplayName = profileData.value?.displayName;
            }
          } catch {}
        }
      }

      return {
        uri: `at://${ref.did}/pub.leaflet.comment/${ref.rkey}`,
        plaintext: value.plaintext ?? "",
        createdAt: value.createdAt,
        authorDid: ref.did,
        authorHandle,
        authorDisplayName,
        reply: value.reply,
      } satisfies LeafletComment;
    }),
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
