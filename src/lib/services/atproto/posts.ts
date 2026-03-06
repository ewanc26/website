// Thin wrappers over @ewanc26/atproto that bind PUBLIC_ATPROTO_DID.
import { PUBLIC_ATPROTO_DID } from '$env/static/public';
import { cache } from './cache';
import {
	fetchLatestBlueskyPost as _fetchLatestBlueskyPost,
	fetchPostFromUri as _fetchPostFromUri,
	fetchBlogPosts as _fetchBlogPosts
} from '@ewanc26/atproto';
import type { BlogPost, BlogPostsData, BlueskyPost } from './types';

export async function fetchLatestBlueskyPost(fetchFn?: typeof fetch): Promise<BlueskyPost | null> {
	return _fetchLatestBlueskyPost(PUBLIC_ATPROTO_DID, fetchFn);
}

export async function fetchPostFromUri(
	uri: string,
	depth: number,
	fetchFn?: typeof fetch
): Promise<BlueskyPost | null> {
	return _fetchPostFromUri(PUBLIC_ATPROTO_DID, uri, depth, fetchFn);
}

/**
 * Fetches blog posts (top 5) from Standard.site documents, using the app cache.
 */
export async function fetchBlogPosts(fetchFn?: typeof fetch): Promise<BlogPostsData> {
	const cacheKey = `blogposts:${PUBLIC_ATPROTO_DID}`;
	const cached = cache.get<BlogPostsData>(cacheKey);
	if (cached) return cached;

	const { posts } = await _fetchBlogPosts(PUBLIC_ATPROTO_DID, fetchFn);

	const sorted = [...posts].sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
	);

	const data: BlogPostsData = { posts: sorted.slice(0, 5) };
	cache.set(cacheKey, data);
	return data;
}
