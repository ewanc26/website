// Thin wrappers over @ewanc26/atproto that bind PUBLIC_ATPROTO_DID so callers
// don't need to pass it explicitly — matching the original app API exactly.
import { PUBLIC_ATPROTO_DID } from '$env/static/public';
import {
	fetchProfile as _fetchProfile,
	fetchSiteInfo as _fetchSiteInfo,
	fetchLinks as _fetchLinks,
	fetchMusicStatus as _fetchMusicStatus,
	fetchKibunStatus as _fetchKibunStatus,
	fetchTangledRepos as _fetchTangledRepos,
	fetchRecentPopfeedReviews as _fetchRecentPopfeedReviews
} from '@ewanc26/atproto';

export async function fetchProfile(fetchFn?: typeof fetch) {
	return _fetchProfile(PUBLIC_ATPROTO_DID, fetchFn);
}

export async function fetchSiteInfo(fetchFn?: typeof fetch) {
	return _fetchSiteInfo(PUBLIC_ATPROTO_DID, fetchFn);
}

export async function fetchLinks(fetchFn?: typeof fetch) {
	return _fetchLinks(PUBLIC_ATPROTO_DID, fetchFn);
}

export async function fetchMusicStatus(fetchFn?: typeof fetch) {
	return _fetchMusicStatus(PUBLIC_ATPROTO_DID, fetchFn);
}

export async function fetchKibunStatus(fetchFn?: typeof fetch) {
	return _fetchKibunStatus(PUBLIC_ATPROTO_DID, fetchFn);
}

export async function fetchTangledRepos(fetchFn?: typeof fetch) {
	return _fetchTangledRepos(PUBLIC_ATPROTO_DID, fetchFn);
}

export async function fetchRecentPopfeedReviews(fetchFn?: typeof fetch) {
	return _fetchRecentPopfeedReviews(PUBLIC_ATPROTO_DID, 5, fetchFn);
}
