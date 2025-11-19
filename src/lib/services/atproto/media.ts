import type { ResolvedIdentity } from './types';
import { resolveIdentity } from './agents';

/**
 * Builds a direct blob URL for a PDS
 */
export function buildPdsBlobUrl(pds: string, did: string, cid: string): string {
	return `${pds.replace(/\/$/, '')}/xrpc/com.atproto.sync.getBlob?did=${encodeURIComponent(did)}&cid=${encodeURIComponent(cid)}`;
}

/**
 * Robustly extracts a CID / blob reference from various image/video shapes
 */
export function extractCidFromImageObject(img: any): string | null {
	if (!img) return null;
	// Common shapes: img.image.ref.$link, img.ref.$link, img.cid
	if (img.image && img.image.ref && img.image.ref.$link) return img.image.ref.$link as string;
	if (img.ref && img.ref.$link) return img.ref.$link as string;
	if (img.cid) return img.cid as string;
	if (typeof img === 'string') return img; // sometimes it's just a cid string
	return null;
}

/**
 * Robust extractor: hunts through `value` shapes for images (and video blobs).
 * - returns up to `limit` URLs (built using PDS when DID is available)
 * - supports value.embed (images, recordWithMedia, record), value.embeds arrays,
 *   and nested structures.
 * - also detects 'app.bsky.embed.video' shapes and returns the video blob URL first
 */
export function extractImageUrlsFromValue(value: any, did: string, limit = 4): string[] {
	const urls: string[] = [];

	try {
		const embed = (value as any)?.embed ?? null;

		if (embed) {
			// images view
			if (embed.$type === 'app.bsky.embed.images#view' && Array.isArray(embed.images)) {
				for (const img of embed.images) {
					// Use fullsize or thumb from view if available
					const imageUrl = img.fullsize || img.thumb;
					if (imageUrl) {
						urls.push(imageUrl);
					} else {
						// Fallback: construct URL from CID
						const cid = extractCidFromImageObject(img);
						if (cid) {
							const cdnUrl = `https://cdn.bsky.app/img/feed_fullsize/plain/${did}/${cid}@jpeg`;
							urls.push(cdnUrl);
						}
					}
					if (urls.length >= limit) return urls;
				}
			}

			// video embed
			if (embed.$type === 'app.bsky.embed.video#view' || embed.$type === 'app.bsky.embed.video') {
				const videoCid =
					(embed as any)?.jobStatus?.blob ??
					(embed as any)?.video?.ref?.$link ??
					(embed as any)?.video?.cid ??
					null;
				if (videoCid) {
					// Use CDN for video blobs
					const videoUrl = `https://video.bsky.app/watch/${did}/${videoCid}/playlist.m3u8`;
					urls.push(videoUrl);
					if (urls.length >= limit) return urls;
				}
			}

			// recordWithMedia with embedded media.images
			if (embed.$type === 'app.bsky.embed.recordWithMedia#view') {
				const media = embed.media;
				if (media && media.$type === 'app.bsky.embed.images#view' && Array.isArray(media.images)) {
					for (const img of media.images) {
						const imageUrl = img.fullsize || img.thumb;
						if (imageUrl) {
							urls.push(imageUrl);
						} else {
							const cid = extractCidFromImageObject(img);
							if (cid) {
								const cdnUrl = `https://cdn.bsky.app/img/feed_fullsize/plain/${did}/${cid}@jpeg`;
								urls.push(cdnUrl);
							}
						}
						if (urls.length >= limit) return urls;
					}
				}

				// Video in recordWithMedia
				if (
					media &&
					(media.$type === 'app.bsky.embed.video#view' || media.$type === 'app.bsky.embed.video')
				) {
					const videoCid = (media as any)?.video?.ref?.$link ?? (media as any)?.video?.cid ?? null;
					if (videoCid) {
						const videoUrl = `https://video.bsky.app/watch/${did}/${videoCid}/playlist.m3u8`;
						urls.push(videoUrl);
						if (urls.length >= limit) return urls;
					}
				}

				// The quoted record itself may contain images in record.value or embeds
				const quotedRecord = embed.record;
				if (quotedRecord) {
					const quotedValue = quotedRecord.value ?? quotedRecord.record?.value ?? null;
					if (quotedValue) {
						const nested = extractImageUrlsFromValue(quotedValue, did, limit - urls.length);
						urls.push(...nested);
						if (urls.length >= limit) return urls;
					}
				}
			}

			// record#view where embed.record may contain value or embeds
			if (embed.$type === 'app.bsky.embed.record#view' && embed.record) {
				const quoted = embed.record;
				const quotedValue = quoted.value ?? quoted.record?.value ?? null;
				if (quotedValue) {
					const nested = extractImageUrlsFromValue(quotedValue, did, limit - urls.length);
					urls.push(...nested);
					if (urls.length >= limit) return urls;
				}
			}
		}

		// embeds array (older/newer shapes can place embeds here)
		if (Array.isArray((value as any).embeds)) {
			for (const e of (value as any).embeds) {
				if (e.$type === 'app.bsky.embed.images#view' && Array.isArray(e.images)) {
					for (const img of e.images) {
						const imageUrl = img.fullsize || img.thumb;
						if (imageUrl) {
							urls.push(imageUrl);
						} else {
							const cid = extractCidFromImageObject(img);
							if (cid) {
								const cdnUrl = `https://cdn.bsky.app/img/feed_fullsize/plain/${did}/${cid}@jpeg`;
								urls.push(cdnUrl);
							}
						}
						if (urls.length >= limit) return urls;
					}
				}

				if (e.$type === 'app.bsky.embed.video#view' || e.$type === 'app.bsky.embed.video') {
					const videoCid =
						(e as any)?.jobStatus?.blob ??
						(e as any)?.video?.ref?.$link ??
						(e as any)?.video?.cid ??
						null;
					if (videoCid) {
						const videoUrl = `https://video.bsky.app/watch/${did}/${videoCid}/playlist.m3u8`;
						urls.push(videoUrl);
						if (urls.length >= limit) return urls;
					}
				}

				if (e.$type === 'app.bsky.embed.recordWithMedia#view') {
					const media = e.media;
					if (
						media &&
						media.$type === 'app.bsky.embed.images#view' &&
						Array.isArray(media.images)
					) {
						for (const img of media.images) {
							const imageUrl = img.fullsize || img.thumb;
							if (imageUrl) {
								urls.push(imageUrl);
							} else {
								const cid = extractCidFromImageObject(img);
								if (cid) {
									const cdnUrl = `https://cdn.bsky.app/img/feed_fullsize/plain/${did}/${cid}@jpeg`;
									urls.push(cdnUrl);
								}
							}
							if (urls.length >= limit) return urls;
						}
					}

					const quotedRec = e.record ?? e.record?.record ?? null;
					const quotedValue = quotedRec?.value ?? null;
					if (quotedValue) {
						const nested = extractImageUrlsFromValue(quotedValue, did, limit - urls.length);
						urls.push(...nested);
						if (urls.length >= limit) return urls;
					}
				}
			}
		}

		// (value as any).embed?.images shape
		if ((value as any)?.embed?.images && Array.isArray((value as any).embed.images)) {
			for (const img of (value as any).embed.images) {
				const imageUrl = img.fullsize || img.thumb;
				if (imageUrl) {
					urls.push(imageUrl);
				} else {
					const cid = extractCidFromImageObject(img);
					if (cid) {
						const cdnUrl = `https://cdn.bsky.app/img/feed_fullsize/plain/${did}/${cid}@jpeg`;
						urls.push(cdnUrl);
					}
				}
				if (urls.length >= limit) return urls;
			}
		}

		// deep search fallback for any 'images' arrays or cid-like strings
		const stack = [value];
		while (stack.length && urls.length < limit) {
			const node = stack.pop();
			if (!node || typeof node !== 'object') continue;
			if (Array.isArray(node.images)) {
				for (const img of node.images) {
					const imageUrl = img.fullsize || img.thumb;
					if (imageUrl) {
						urls.push(imageUrl);
					} else {
						const cid = extractCidFromImageObject(img);
						if (cid) {
							const cdnUrl = `https://cdn.bsky.app/img/feed_fullsize/plain/${did}/${cid}@jpeg`;
							urls.push(cdnUrl);
						}
					}
					if (urls.length >= limit) break;
				}
			}
			for (const k of Object.keys(node)) {
				const v = node[k];
				if (v && typeof v === 'object') stack.push(v);
			}
		}
	} catch (err) {
		// be conservative: if anything goes wrong here, just return what we have
		console.warn('Error extracting image/video URLs from value:', err);
	}

	return urls.slice(0, limit);
}
