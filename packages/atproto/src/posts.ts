import { cache } from './cache.js';
import { withFallback } from './agents.js';
import type { BlueskyPost, PostAuthor, ExternalLink } from './types.js';

export async function fetchLatestBlueskyPost(
	did: string,
	fetchFn?: typeof fetch
): Promise<BlueskyPost | null> {
	const cacheKey = `blueskypost:latest:${did}`;
	const cached = cache.get<BlueskyPost>(cacheKey);
	if (cached) return cached;

	try {
		const feedResponse = await withFallback(
			did,
			async (agent) => agent.getAuthorFeed({ actor: did, limit: 5 }),
			false,
			fetchFn
		);

		const feed = feedResponse.data.feed;
		if (!feed.length) return null;

		const latestFeedItem = feed[0];
		const latestPostData = latestFeedItem.post;

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
		}

		const post = await fetchPostFromUri(did, latestPostData.uri, 0, fetchFn);
		if (!post) return null;

		if (isRepost) {
			post.isRepost = true;
			post.repostAuthor = repostAuthor;
			post.repostCreatedAt = repostCreatedAt;
			post.originalPost = { ...post };
		}

		cache.set(cacheKey, post);
		return post;
	} catch {
		return null;
	}
}

export async function fetchPostFromUri(
	did: string,
	uri: string,
	depth: number,
	fetchFn?: typeof fetch
): Promise<BlueskyPost | null> {
	if (depth >= 3) return null;

	try {
		const threadResponse = await withFallback(
			did,
			async (agent) => agent.getPostThread({ uri, depth: 0 }),
			false,
			fetchFn
		);

		if (!threadResponse.data.thread || !('post' in threadResponse.data.thread)) return null;

		const postData = threadResponse.data.thread.post;
		const value = postData.record as any;
		const embed = (postData as any).embed ?? null;

		const author: PostAuthor = {
			did: postData.author.did,
			handle: postData.author.handle,
			displayName: postData.author.displayName,
			avatar: postData.author.avatar
		};

		let imageUrls: string[] | undefined;
		let imageAlts: string[] | undefined;
		let hasImages = false;
		let hasVideo = false;
		let videoUrl: string | undefined;
		let videoThumbnail: string | undefined;
		let quotedPost: BlueskyPost | undefined;
		let quotedPostUri: string | undefined;
		let externalLink: ExternalLink | undefined;

		const facets = value.facets;

		if (embed?.$type === 'app.bsky.embed.images#view' && Array.isArray(embed.images)) {
			hasImages = true;
			imageUrls = [];
			imageAlts = [];
			for (const img of embed.images) {
				const imageUrl = img.fullsize || img.thumb;
				if (imageUrl) { imageUrls.push(imageUrl); imageAlts.push(img.alt || ''); }
			}
		}

		if (embed?.$type === 'app.bsky.embed.video#view') {
			if (embed.playlist) { hasVideo = true; videoUrl = embed.playlist; }
			if (embed.thumbnail) videoThumbnail = embed.thumbnail;
		}

		if (embed?.$type === 'app.bsky.embed.external#view' && embed.external) {
			externalLink = {
				uri: embed.external.uri,
				title: embed.external.title,
				description: embed.external.description,
				thumb: embed.external.thumb
			};
		}

		if (embed?.$type === 'app.bsky.embed.recordWithMedia#view') {
			const media = embed.media;
			if (media?.$type === 'app.bsky.embed.images#view' && Array.isArray(media.images)) {
				hasImages = true;
				imageUrls = [];
				imageAlts = [];
				for (const img of media.images) {
					const imageUrl = img.fullsize || img.thumb;
					if (imageUrl) { imageUrls.push(imageUrl); imageAlts.push(img.alt || ''); }
				}
			}
			if (media?.$type === 'app.bsky.embed.video#view') {
				if (media.playlist) { hasVideo = true; videoUrl = media.playlist; }
				if (media.thumbnail) videoThumbnail = media.thumbnail;
			}
			if (media?.$type === 'app.bsky.embed.external#view' && media.external) {
				externalLink = {
					uri: media.external.uri,
					title: media.external.title,
					description: media.external.description,
					thumb: media.external.thumb
				};
			}
			const quotedRecord = embed.record?.record || embed.record;
			if (quotedRecord?.uri) {
				quotedPostUri = quotedRecord.uri as string;
				quotedPost = (await fetchPostFromUri(did, quotedPostUri, depth + 1, fetchFn)) ?? undefined;
			}
		}

		if (embed?.$type === 'app.bsky.embed.record#view') {
			const quotedRecord = embed.record?.record || embed.record;
			if (quotedRecord?.uri) {
				quotedPostUri = quotedRecord.uri as string;
				quotedPost = (await fetchPostFromUri(did, quotedPostUri, depth + 1, fetchFn)) ?? undefined;
			}
		}

		let replyParent: BlueskyPost | undefined;
		let replyRoot: BlueskyPost | undefined;
		if (value.reply) {
			if (value.reply.parent?.uri) {
				replyParent = (await fetchPostFromUri(did, value.reply.parent.uri as string, depth + 1, fetchFn)) ?? undefined;
			}
			if (value.reply.root?.uri && value.reply.root.uri !== value.reply.parent?.uri) {
				replyRoot = (await fetchPostFromUri(did, value.reply.root.uri as string, depth + 1, fetchFn)) ?? undefined;
			}
		}

		return {
			text: value.text,
			createdAt: value.createdAt,
			uri: postData.uri,
			author,
			likeCount: postData.likeCount || 0,
			repostCount: postData.repostCount || 0,
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
	} catch {
		return null;
	}
}
