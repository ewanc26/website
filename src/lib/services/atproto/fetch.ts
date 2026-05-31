import { PUBLIC_ATPROTO_DID } from "$env/static/public";
import {
  fetchKibunStatus as _fetchKibunStatus,
  fetchBlogPosts as _fetchBlogPosts,
  fetchProfile as _fetchProfile,
  fetchDocuments as _fetchDocuments,
  fetchPublications as _fetchPublications,
  fetchSiteInfo as _fetchSiteInfo,
} from "@ewanc26/atproto";
import { getPDSAgent } from "./agents";

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
}

/**
 * Fetch subscriptions and resolve each publication record.
 * Each subscription points to an AT URI for a publication on another DID's PDS,
 * so we resolve the DID → PDS → fetch the publication record.
 */
export async function fetchSubscriptions(
  fetchFn: typeof fetch = fetch,
): Promise<SubscriptionPublication[]> {
  const agent = await getPDSAgent();
  const allRecords: { uri: string; value: { publication: string } }[] = [];
  let cursor: string | undefined;

  // Paginate through all subscription records
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

  // Resolve each publication AT URI → DID + rkey, then fetch via DID resolution
  const resolved = await Promise.allSettled(
    allRecords.map(async (record) => {
      const pubUri = record.value.publication;
      const parts = pubUri.replace("at://", "").split("/");
      const did = parts[0];
      const rkey = parts[parts.length - 1];

      // Resolve DID to find PDS
      const didRes = await fetchFn(
        `https://plc.directory/${encodeURIComponent(did)}`,
      );
      if (!didRes.ok) throw new Error(`DID resolution failed for ${did}`);
      const didDoc = await didRes.json();
      const pdsUrl = didDoc.service?.[0]?.serviceEndpoint;
      if (!pdsUrl) throw new Error(`No PDS for ${did}`);

      // Fetch the publication record from their PDS
      const pubRes = await fetchFn(
        `${pdsUrl}/xrpc/com.atproto.repo.getRecord?repo=${encodeURIComponent(did)}&collection=site.standard.publication&rkey=${rkey}`,
      );
      if (!pubRes.ok) throw new Error(`Publication not found: ${pubUri}`);
      const pubData = await pubRes.json();
      const value = pubData.value;

      return {
        uri: pubUri,
        name: value.name ?? "Unknown",
        url: value.url ?? "#",
        description: value.description,
      } satisfies SubscriptionPublication;
    }),
  );

  return resolved
    .filter(
      (r): r is PromiseFulfilledResult<SubscriptionPublication> =>
        r.status === "fulfilled",
    )
    .map((r) => r.value);
}

export async function fetchBlob(ref: any) {
  const agent = await getPDSAgent();
  const cid = ref.$link || ref.ref?.$link || ref;
  const blob = await agent.getBlob({ did: PUBLIC_ATPROTO_DID, cid });
  return new Uint8Array(blob.data);
}
