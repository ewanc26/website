// Thin wrappers over @ewanc26/atproto that bind PUBLIC_ATPROTO_DID.
import { PUBLIC_ATPROTO_DID } from '$env/static/public';
import {
	fetchPublications as _fetchPublications,
	fetchDocuments as _fetchDocuments,
	fetchRecentDocuments as _fetchRecentDocuments,
	fetchBlogPosts as _fetchBlogPosts
} from '@ewanc26/atproto';

export type {
	StandardSitePublication,
	StandardSitePublicationsData,
	StandardSiteDocument,
	StandardSiteDocumentsData
} from '@ewanc26/atproto';

export async function fetchPublications(fetchFn?: typeof fetch) {
	return _fetchPublications(PUBLIC_ATPROTO_DID, fetchFn);
}

export async function fetchDocuments(fetchFn?: typeof fetch) {
	return _fetchDocuments(PUBLIC_ATPROTO_DID, fetchFn);
}

export async function fetchRecentDocuments(limit = 5, fetchFn?: typeof fetch) {
	return _fetchRecentDocuments(PUBLIC_ATPROTO_DID, limit, fetchFn);
}

export async function fetchBlogPosts(fetchFn?: typeof fetch) {
	return _fetchBlogPosts(PUBLIC_ATPROTO_DID, fetchFn);
}
