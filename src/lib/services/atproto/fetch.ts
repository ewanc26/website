import { PUBLIC_ATPROTO_DID } from "$env/static/public";
import {
  fetchKibunStatus as _fetchKibunStatus,
  fetchBlogPosts as _fetchBlogPosts,
  fetchProfile as _fetchProfile,
  fetchDocuments as _fetchDocuments,
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

export async function fetchBlob(ref: any) {
  const agent = await getPDSAgent();
  const cid = ref.$link || ref.ref?.$link || ref;
  const blob = await agent.getBlob({ did: PUBLIC_ATPROTO_DID, cid });
  return new Uint8Array(blob.data);
}
