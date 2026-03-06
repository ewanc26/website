export function buildPdsBlobUrl(pds: string, did: string, cid: string): string {
	return `${pds.replace(/\/$/, '')}/xrpc/com.atproto.sync.getBlob?did=${encodeURIComponent(did)}&cid=${encodeURIComponent(cid)}`;
}

export function extractCidFromImageObject(img: any): string | null {
	if (!img) return null;
	if (img.image && img.image.ref && img.image.ref.$link) return img.image.ref.$link as string;
	if (img.ref && img.ref.$link) return img.ref.$link as string;
	if (img.cid) return img.cid as string;
	if (typeof img === 'string') return img;
	return null;
}

export function extractImageUrlsFromValue(value: any, did: string, limit = 4): string[] {
	const urls: string[] = [];

	try {
		const embed = (value as any)?.embed ?? null;

		if (embed) {
			if (embed.$type === 'app.bsky.embed.images#view' && Array.isArray(embed.images)) {
				for (const img of embed.images) {
					const imageUrl = img.fullsize || img.thumb;
					if (imageUrl) urls.push(imageUrl);
					else {
						const cid = extractCidFromImageObject(img);
						if (cid) urls.push(`https://cdn.bsky.app/img/feed_fullsize/plain/${did}/${cid}@jpeg`);
					}
					if (urls.length >= limit) return urls;
				}
			}

			if (embed.$type === 'app.bsky.embed.video#view' || embed.$type === 'app.bsky.embed.video') {
				const videoCid =
					(embed as any)?.jobStatus?.blob ??
					(embed as any)?.video?.ref?.$link ??
					(embed as any)?.video?.cid ??
					null;
				if (videoCid) {
					urls.push(`https://video.bsky.app/watch/${did}/${videoCid}/playlist.m3u8`);
					if (urls.length >= limit) return urls;
				}
			}

			if (embed.$type === 'app.bsky.embed.recordWithMedia#view') {
				const media = embed.media;
				if (
					media &&
					media.$type === 'app.bsky.embed.images#view' &&
					Array.isArray(media.images)
				) {
					for (const img of media.images) {
						const imageUrl = img.fullsize || img.thumb;
						if (imageUrl) urls.push(imageUrl);
						else {
							const cid = extractCidFromImageObject(img);
							if (cid)
								urls.push(`https://cdn.bsky.app/img/feed_fullsize/plain/${did}/${cid}@jpeg`);
						}
						if (urls.length >= limit) return urls;
					}
				}
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

			if (embed.$type === 'app.bsky.embed.record#view' && embed.record) {
				const quotedValue =
					embed.record.value ?? embed.record.record?.value ?? null;
				if (quotedValue) {
					const nested = extractImageUrlsFromValue(quotedValue, did, limit - urls.length);
					urls.push(...nested);
					if (urls.length >= limit) return urls;
				}
			}
		}

		if (Array.isArray((value as any).embeds)) {
			for (const e of (value as any).embeds) {
				if (e.$type === 'app.bsky.embed.images#view' && Array.isArray(e.images)) {
					for (const img of e.images) {
						const imageUrl = img.fullsize || img.thumb;
						if (imageUrl) urls.push(imageUrl);
						else {
							const cid = extractCidFromImageObject(img);
							if (cid)
								urls.push(`https://cdn.bsky.app/img/feed_fullsize/plain/${did}/${cid}@jpeg`);
						}
						if (urls.length >= limit) return urls;
					}
				}
			}
		}
	} catch {
		// conservative: return what we have
	}

	return urls.slice(0, limit);
}
