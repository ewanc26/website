import { PUBLIC_ATPROTO_DID } from '$env/static/public';
import { 
    fetchKibunStatus as _fetchKibunStatus,
    fetchBlogPosts as _fetchBlogPosts
} from '@ewanc26/atproto';

export async function fetchKibunStatus(fetchFn?: typeof fetch) {
	return _fetchKibunStatus(PUBLIC_ATPROTO_DID, fetchFn);
}

export async function fetchBlogPosts(fetchFn?: typeof fetch) {
	return _fetchBlogPosts(PUBLIC_ATPROTO_DID, fetchFn);
}

