import { cache } from './cache.js';

export type EngagementType = 'app.bsky.feed.like' | 'app.bsky.feed.repost';

interface EngagementResponse {
	dids: string[];
	cursor?: string;
}

export async function fetchEngagementFromConstellation(
	uri: string,
	type: EngagementType,
	cursor?: string
): Promise<EngagementResponse> {
	const cacheKey = `engagement:${type}:${uri}:${cursor || 'initial'}`;
	const cached = cache.get<EngagementResponse>(cacheKey);
	if (cached) return cached;

	const url = new URL('https://constellation.microcosm.blue/links/distinct-dids');
	url.searchParams.append('target', uri);
	url.searchParams.append('collection', type);
	url.searchParams.append('path', '');
	url.searchParams.append('limit', '100');
	if (cursor) url.searchParams.append('cursor', cursor);

	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Constellation HTTP error! Status: ${response.status}`);
	}

	const data = await response.json();
	const result: EngagementResponse = {
		dids: data.dids || [],
		cursor: data.cursor
	};

	cache.set(cacheKey, result);
	return result;
}

export async function fetchAllEngagement(uri: string, type: EngagementType): Promise<string[]> {
	const allDids: Set<string> = new Set();
	let cursor: string | undefined = undefined;

	try {
		do {
			const response = await fetchEngagementFromConstellation(uri, type, cursor);
			response.dids.forEach((did) => allDids.add(did));
			cursor = response.cursor;
		} while (cursor);
	} catch {
		// return what we have
	}

	return Array.from(allDids);
}
