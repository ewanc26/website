import { PUBLIC_ATPROTO_DID } from '$env/static/public';
import { cache } from './cache';
import { withFallback, defaultAgent, createAgent } from './agents';
import { resolveIdentity } from './agents';
import { buildPdsBlobUrl } from './media';
import { fetchAllEngagement } from './engagement';
import type {
	BlogPost,
	BlogPostsData,
	BlueskyPost,
	PostAuthor,
	ExternalLink,
	LeafletPublication,
	LeafletPublicationsData
} from './types';
import { fetchStandardSiteDocuments } from './standard';

/**
 * Fetches all Leaflet publications for a user
 */
export async function fetchLeafletPublications(
	fetchFn?: typeof fetch
): Promise<LeafletPublicationsData> {
	console.info('[Leaflet] Fetching publications');
	const cacheKey = `leaflet:publications:${PUBLIC_ATPROTO_DID}`;
	const cached = cache.get<LeafletPublicationsData>(cacheKey);
	if (cached) {
		console.debug('[Leaflet] Returning cached publications');
		return cached;
	}

	const publications: LeafletPublication[] = [];
	console.info('[Leaflet] Cache miss, fetching from network');

	try {
		console.debug('[Leaflet] Querying publications records');
		const publicationsRecords = await withFallback(
			PUBLIC_ATPROTO_DID,
			async (agent) => {
				const response = await agent.com.atproto.repo.listRecords({
					repo: PUBLIC_ATPROTO_DID,
					collection: 'pub.leaflet.publication',
					limit: 100
				});
				return response.data.records;
			},
			true,
			fetchFn
		);

		for (const pubRecord of publicationsRecords) {
			const pubValue = pubRecord.value as any;
			const rkey = pubRecord.uri.split('/').pop() || '';

			publications.push({
				name: pubValue.name || 'Untitled Publication',
				rkey,
				uri: pubRecord.uri,
				basePath: pubValue.base_path,
				description: pubValue.description,
				icon: pubValue.icon ? await getBlobUrl(pubValue.icon, fetchFn) : undefined
			});
		}

		const data: LeafletPublicationsData = { publications };
		cache.set(cacheKey, data);
		return data;
	} catch (error) {
		console.warn('Failed to fetch Leaflet publications:', error);
		return { publications: [] };
	}
}

/**
 * Helper function to get a blob URL for Leaflet publication icons
 */
async function getBlobUrl(blob: any, fetchFn?: typeof fetch): Promise<string | undefined> {
	try {
		const cid = blob.ref?.$link || blob.cid;
		if (!cid) return undefined;

		const resolved = await resolveIdentity(PUBLIC_ATPROTO_DID, fetchFn);
		return buildPdsBlobUrl(resolved.pds, PUBLIC_ATPROTO_DID, cid);
	} catch (error) {
		console.warn('Failed to resolve blob URL:', error);
		return undefined;
	}
}

/**
 * Fetches blog posts from WhiteWind, Leaflet, and Standard.site sources
 * Supports multiple publications from all platforms
 */
export async function fetchBlogPosts(fetchFn?: typeof fetch): Promise<BlogPostsData> {
	const cacheKey = `blogposts:${PUBLIC_ATPROTO_DID}`;
	const cached = cache.get<BlogPostsData>(cacheKey);
	if (cached) return cached;

	const posts: BlogPost[] = [];

	// Fetch WhiteWind posts
	try {
		const whiteWindRecords = await withFallback(
			PUBLIC_ATPROTO_DID,
			async (agent) => {
				const response = await agent.com.atproto.repo.listRecords({
					repo: PUBLIC_ATPROTO_DID,
					collection: 'com.whtwnd.blog.entry',
					limit: 100
				});
				return response.data.records;
			},
			true,
			fetchFn
		);

		for (const record of whiteWindRecords) {
			const value = record.value as any;
			// Skip drafts and non-public posts
			if (value.isDraft || (value.visibility && value.visibility !== 'public')) {
				continue;
			}

			posts.push({
				title: value.title || 'Untitled Post',
				url: `https://whtwnd.com/${PUBLIC_ATPROTO_DID}/${record.uri.split('/').pop()}`,
				createdAt: value.createdAt || record.value.createdAt || new Date().toISOString(),
				platform: 'WhiteWind',
				description: value.subtitle,
				rkey: record.uri.split('/').pop() || ''
			});
		}
	} catch (error) {
		console.warn('Failed to fetch WhiteWind posts:', error);
	}

	// Fetch Leaflet publications and documents
	try {
		// Get all publications first
		const publicationsData = await fetchLeafletPublications(fetchFn);
		const publicationsMap = new Map<string, LeafletPublication>();
		for (const pub of publicationsData.publications) {
			publicationsMap.set(pub.uri, pub);
		}

		// Fetch all Leaflet documents
		const leafletDocsRecords = await withFallback(
			PUBLIC_ATPROTO_DID,
			async (agent) => {
				const response = await agent.com.atproto.repo.listRecords({
					repo: PUBLIC_ATPROTO_DID,
					collection: 'pub.leaflet.document',
					limit: 100
				});
				return response.data.records;
			},
			true,
			fetchFn
		);

		for (const record of leafletDocsRecords) {
			const value = record.value as any;
			const rkey = record.uri.split('/').pop() || '';
			const publicationUri = value.publication;
			const publication = publicationsMap.get(publicationUri);

			// Determine URL based on priority: publication base_path → Leaflet /p/[DID]/[rkey] format
			let url: string;
			const publicationRkey = publicationUri ? publicationUri.split('/').pop() : undefined;

			if (publication?.basePath) {
				// Ensure basePath is a complete URL
				const basePath = publication.basePath.startsWith('http')
					? publication.basePath
					: `https://${publication.basePath}`;
				url = `${basePath}/${rkey}`;
			} else {
				// Fallback format: https://leaflet.pub/p/[DID]/[rkey]
				url = `https://leaflet.pub/p/${PUBLIC_ATPROTO_DID}/${rkey}`;
			}

			posts.push({
				title: value.title || 'Untitled Document',
				url,
				createdAt: value.publishedAt || new Date().toISOString(),
				platform: 'leaflet',
				description: value.description,
				rkey,
				publicationName: publication?.name,
				publicationRkey
			});
		}
	} catch (error) {
		console.warn('Failed to fetch Leaflet documents:', error);
	}

	// Fetch Standard.site documents
	try {
		const standardDocumentsData = await fetchStandardSiteDocuments(fetchFn);

		for (const doc of standardDocumentsData.documents) {
			posts.push({
				title: doc.title,
				url: doc.url,
				createdAt: doc.publishedAt,
				platform: 'standard.site',
				description: doc.description,
				rkey: doc.rkey,
				publicationName: doc.publicationName,
				publicationRkey: doc.publicationRkey
			});
		}
	} catch (error) {
		console.warn('Failed to fetch Standard.site documents:', error);
	}

	// Sort by date (newest first) and take top 5
	posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
	const topPosts = posts.slice(0, 5);

	const data: BlogPostsData = { posts: topPosts };
	cache.set(cacheKey, data);
	return data;
}

/**
 * Fetches the latest Bluesky post (including replies and reposts)
 */
export async function fetchLatestBlueskyPost(fetchFn?: typeof fetch): Promise<BlueskyPost | null> {
	console.log('[fetchLatestBlueskyPost] Starting fetch...');
	const cacheKey = `blueskypost:latest:${PUBLIC_ATPROTO_DID}`;
	const cached = cache.get<BlueskyPost>(cacheKey);
	if (cached) {
		console.log('[fetchLatestBlueskyPost] Returning cached post');
		return cached;
	}

	try {
		console.log('[fetchLatestBlueskyPost] Fetching author feed...');
		// Use withFallback to get posts AND reposts in chronological order
		const feedResponse = await withFallback(
			PUBLIC_ATPROTO_DID,
			async (agent) => {
				return agent.getAuthorFeed({
					actor: PUBLIC_ATPROTO_DID,
					limit: 5
				});
			},
			false,
			fetchFn
		);

		const feed = feedResponse.data.feed;
		console.log('[fetchLatestBlueskyPost] Feed items fetched:', feed.length);

		if (feed.length === 0) {
			console.warn('[fetchLatestBlueskyPost] No feed items found');
			return null;
		}

		// Take the latest feed item (first in array)
		const latestFeedItem = feed[0];
		const latestPostData = latestFeedItem.post;
		console.log('[fetchLatestBlueskyPost] Found latest feed item:', latestPostData.uri);

		// Check if this is a repost
		const isRepost = latestFeedItem.reason?.$type === 'app.bsky.feed.defs#reasonRepost';
		let repostAuthor: PostAuthor | undefined;
		let repostCreatedAt: string | undefined;

		if (isRepost && latestFeedItem.reason) {
			const reason = latestFeedItem.reason as any;
			repostAuthor = {
				did: reason.by.did,
				handle: reason.by.handle,
				displayName: reason.by.displayName,
				avatar: reason.by.avatar
			};
			repostCreatedAt = reason.indexedAt;
			console.log('[fetchLatestBlueskyPost] This is a repost by:', repostAuthor.handle);
		}

		// Fetch the full post data
		const post = await fetchPostFromUri(latestPostData.uri, 0, fetchFn);

		if (!post) {
			console.warn('[fetchLatestBlueskyPost] fetchPostFromUri returned null');
			return null;
		}

		// Add repost context if applicable
		if (isRepost) {
			post.isRepost = true;
			post.repostAuthor = repostAuthor;
			post.repostCreatedAt = repostCreatedAt;
			// Store the original post data
			post.originalPost = { ...post };
		}

		console.log('[fetchLatestBlueskyPost] Post fetched successfully, caching...');
		cache.set(cacheKey, post);
		return post;
	} catch (error) {
		console.error('[fetchLatestBlueskyPost] Failed to fetch latest Bluesky post:', error);
		return null;
	}
}

/**
 * Recursively fetches a Bluesky post by URI, supporting quoted posts up to 2 levels deep
 */
export async function fetchPostFromUri(
	uri: string,
	depth: number,
	fetchFn?: typeof fetch
): Promise<BlueskyPost | null> {
	console.log(`[fetchPostFromUri] Starting fetch at depth ${depth} for URI:`, uri);

	if (depth >= 3) {
		console.log(`[fetchPostFromUri] Max depth reached (${depth}), stopping recursion`);
		return null;
	}

	try {
		console.log(`[fetchPostFromUri] Fetching post thread from Bluesky API...`);
		const threadResponse = await withFallback(
			PUBLIC_ATPROTO_DID,
			async (agent) => {
				return agent.getPostThread({ uri, depth: 0 });
			},
			false,
			fetchFn
		);

		if (!threadResponse.data.thread || !('post' in threadResponse.data.thread)) {
			console.warn(`[fetchPostFromUri] No valid thread data found for URI:`, uri);
			return null;
		}

		const postData = threadResponse.data.thread.post;
		console.log(`[fetchPostFromUri] Post data received:`, {
			uri: postData.uri,
			author: postData.author.handle,
			hasEmbed: !!postData.embed,
			embedType: postData.embed?.$type
		});

		const value = postData.record as any;
		const embed = (postData as any).embed ?? null;

		// Extract author information
		const author: PostAuthor = {
			did: postData.author.did,
			handle: postData.author.handle,
			displayName: postData.author.displayName,
			avatar: postData.author.avatar
		};
		console.log(`[fetchPostFromUri] Author extracted:`, author);

		// Get the author's DID for blob resolution
		const authorDid = postData.author.did;

		let imageUrls: string[] | undefined;
		let imageAlts: string[] | undefined;
		let hasImages = false;
		let hasVideo = false;
		let videoUrl: string | undefined;
		let videoThumbnail: string | undefined;
		let quotedPost: BlueskyPost | undefined;
		let quotedPostUri: string | undefined;
		let externalLink: ExternalLink | undefined;

		// Extract facets from the record
		const facets = value.facets;
		console.log(`[fetchPostFromUri] Facets found:`, facets?.length || 0);

		// Process images
		if (embed?.$type === 'app.bsky.embed.images#view' && Array.isArray(embed.images)) {
			console.log(`[fetchPostFromUri] Processing images embed, count:`, embed.images.length);
			hasImages = true;
			imageUrls = [];
			imageAlts = [];
			for (const img of embed.images) {
				const imageUrl = img.fullsize || img.thumb;
				if (imageUrl) {
					imageUrls.push(imageUrl);
					imageAlts.push(img.alt || '');
				}
			}
			console.log(`[fetchPostFromUri] Final image URLs:`, imageUrls);
		}

		// Process video
		if (embed?.$type === 'app.bsky.embed.video#view') {
			console.log(`[fetchPostFromUri] Processing video embed`);
			const videoCid = embed.playlist;
			if (videoCid) {
				hasVideo = true;
				videoUrl = videoCid;
				console.log(`[fetchPostFromUri] Video URL:`, videoUrl);
			}
			const thumbnailUrl = embed.thumbnail;
			if (thumbnailUrl) {
				videoThumbnail = thumbnailUrl;
				console.log(`[fetchPostFromUri] Video thumbnail URL:`, videoThumbnail);
			}
		}

		// Process external link
		if (embed?.$type === 'app.bsky.embed.external#view') {
			console.log(`[fetchPostFromUri] Processing external link embed`);
			const external = embed.external;
			if (external) {
				externalLink = {
					uri: external.uri,
					title: external.title,
					description: external.description,
					thumb: external.thumb
				};
				console.log(`[fetchPostFromUri] External link:`, externalLink.uri);
			}
		}

		// Process recordWithMedia (quoted post with media)
		if (embed?.$type === 'app.bsky.embed.recordWithMedia#view') {
			console.log(`[fetchPostFromUri] Processing recordWithMedia embed`);
			const media = embed.media;

			// Extract images from media
			if (media?.$type === 'app.bsky.embed.images#view' && Array.isArray(media.images)) {
				console.log(
					`[fetchPostFromUri] Processing images in recordWithMedia, count:`,
					media.images.length
				);
				hasImages = true;
				imageUrls = [];
				imageAlts = [];
				for (const img of media.images) {
					const imageUrl = img.fullsize || img.thumb;
					if (imageUrl) {
						imageUrls.push(imageUrl);
						imageAlts.push(img.alt || '');
					}
				}
				console.log(`[fetchPostFromUri] Final media image URLs:`, imageUrls);
			}

			// Extract video from media
			if (media?.$type === 'app.bsky.embed.video#view') {
				console.log(`[fetchPostFromUri] Processing video in recordWithMedia`);
				const videoCid = media.playlist;
				if (videoCid) {
					hasVideo = true;
					videoUrl = videoCid;
					console.log(`[fetchPostFromUri] Media video URL:`, videoUrl);
				}
				const thumbnailUrl = media.thumbnail;
				if (thumbnailUrl) {
					videoThumbnail = thumbnailUrl;
					console.log(`[fetchPostFromUri] Media video thumbnail:`, videoThumbnail);
				}
			}

			// Extract external link from media
			if (media?.$type === 'app.bsky.embed.external#view') {
				console.log(`[fetchPostFromUri] Processing external link in recordWithMedia`);
				const external = media.external;
				if (external) {
					externalLink = {
						uri: external.uri,
						title: external.title,
						description: external.description,
						thumb: external.thumb
					};
					console.log(`[fetchPostFromUri] Media external link:`, externalLink.uri);
				}
			}

			// Extract quoted record
			const quotedRecord = embed.record?.record || embed.record;
			console.log(`[fetchPostFromUri] Quoted record in recordWithMedia:`, quotedRecord?.uri);
			if (quotedRecord && typeof quotedRecord.uri === 'string') {
				quotedPostUri = quotedRecord.uri;
				console.log(
					`[fetchPostFromUri] Recursively fetching quoted post at depth ${depth + 1}:`,
					quotedPostUri
				);
				if (quotedPostUri) {
					quotedPost = (await fetchPostFromUri(quotedPostUri, depth + 1, fetchFn)) ?? undefined;
					console.log(`[fetchPostFromUri] Quoted post fetched:`, quotedPost ? 'success' : 'failed');
				}
			}
		}

		// Process simple quoted post (without media)
		if (embed?.$type === 'app.bsky.embed.record#view') {
			console.log(`[fetchPostFromUri] Processing simple record embed (quoted post)`);
			const quotedRecord = embed.record?.record || embed.record;
			console.log(`[fetchPostFromUri] Quoted record:`, quotedRecord?.uri);
			if (quotedRecord && typeof quotedRecord.uri === 'string') {
				quotedPostUri = quotedRecord.uri;
				console.log(
					`[fetchPostFromUri] Recursively fetching quoted post at depth ${depth + 1}:`,
					quotedPostUri
				);
				if (quotedPostUri) {
					quotedPost = (await fetchPostFromUri(quotedPostUri, depth + 1, fetchFn)) ?? undefined;
					console.log(`[fetchPostFromUri] Quoted post fetched:`, quotedPost ? 'success' : 'failed');
				}
			}
		}

		// Handle reply context
		let replyParent: BlueskyPost | undefined;
		let replyRoot: BlueskyPost | undefined;
		if (value.reply) {
			console.log(`[fetchPostFromUri] Post is a reply, fetching parent...`);
			if (value.reply.parent?.uri) {
				replyParent =
					(await fetchPostFromUri(value.reply.parent.uri, depth + 1, fetchFn)) ?? undefined;
			}
			if (value.reply.root?.uri && value.reply.root.uri !== value.reply.parent?.uri) {
				replyRoot = (await fetchPostFromUri(value.reply.root.uri, depth + 1, fetchFn)) ?? undefined;
			}
		}

		// Get engagement data from Constellation as a fallback
		let finalLikeCount = postData.likeCount;
		let finalRepostCount = postData.repostCount;

		try {
			const [likers, reposters] = await Promise.all([
				fetchAllEngagement(postData.uri, 'app.bsky.feed.like'),
				fetchAllEngagement(postData.uri, 'app.bsky.feed.repost')
			]);
			finalLikeCount = Math.max(postData.likeCount || 0, likers.length);
			finalRepostCount = Math.max(postData.repostCount || 0, reposters.length);
		} catch (error: unknown) {
			console.warn('[fetchPostFromUri] Failed to fetch engagement from Constellation:', error);
		}

		const post: BlueskyPost = {
			text: value.text,
			createdAt: value.createdAt,
			uri: postData.uri,
			author,
			likeCount: finalLikeCount,
			repostCount: finalRepostCount,
			replyCount: postData.replyCount,
			hasImages,
			imageUrls,
			imageAlts,
			hasVideo,
			videoUrl,
			videoThumbnail,
			quotedPostUri,
			quotedPost,
			facets,
			externalLink,
			replyParent,
			replyRoot
		};

		console.log(`[fetchPostFromUri] Post construction complete at depth ${depth}:`, {
			hasImages,
			imageCount: imageUrls?.length,
			hasVideo,
			hasQuotedPost: !!quotedPost,
			hasExternalLink: !!externalLink
		});

		return post;
	} catch (err) {
		console.error(`[fetchPostFromUri] Failed to fetch post at depth ${depth}:`, err);
		return null;
	}
}
