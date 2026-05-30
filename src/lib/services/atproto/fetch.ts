import { PUBLIC_ATPROTO_DID } from '$env/static/public';
import { 
    fetchKibunStatus as _fetchKibunStatus,
    fetchBlogPosts as _fetchBlogPosts,
    fetchProfile as _fetchProfile
} from '@ewanc26/atproto';

export async function fetchKibunStatus(fetchFn?: typeof fetch) {
	return _fetchKibunStatus(PUBLIC_ATPROTO_DID, fetchFn);
}

export async function fetchBlogPosts(fetchFn?: typeof fetch) {
	return _fetchBlogPosts(PUBLIC_ATPROTO_DID, fetchFn);
}

export async function fetchProfile(fetchFn?: typeof fetch) {
	return _fetchProfile(PUBLIC_ATPROTO_DID, fetchFn);
}

