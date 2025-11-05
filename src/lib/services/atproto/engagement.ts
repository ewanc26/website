import { cache } from './cache';

export type EngagementType = 'app.bsky.feed.like' | 'app.bsky.feed.repost';

interface EngagementResponse {
    dids: string[];
    cursor?: string;
}

/**
 * Fetches engagement data (likes/reposts) for a post from Constellation as a fallback
 */
export async function fetchEngagementFromConstellation(
    uri: string,
    type: EngagementType,
    cursor?: string
): Promise<EngagementResponse> {
    console.info(`[Constellation] Fetching ${type} data for ${uri}`);
    
    const cacheKey = `engagement:${type}:${uri}:${cursor || 'initial'}`;
    const cached = cache.get<EngagementResponse>(cacheKey);
    if (cached) {
        console.debug('[Constellation] Returning cached engagement data');
        return cached;
    }

    try {
        const url = new URL('https://constellation.microcosm.blue/links/distinct-dids');
        url.searchParams.append('target', uri);
        url.searchParams.append('collection', type);
        url.searchParams.append('path', '');
        url.searchParams.append('limit', '100');
        if (cursor) {
            url.searchParams.append('cursor', cursor);
        }

        console.debug(`[Constellation] Requesting: ${url.toString()}`);
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Constellation HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.debug('[Constellation] Response received:', data);

        const result: EngagementResponse = {
            dids: data.dids || [],
            cursor: data.cursor
        };

        // Cache the results
        cache.set(cacheKey, result);
        return result;
    } catch (error) {
        console.error('[Constellation] Failed to fetch engagement data:', error);
        throw error;
    }
}

/**
 * Fetches all engagement data by paginating through results
 */
export async function fetchAllEngagement(
    uri: string,
    type: EngagementType
): Promise<string[]> {
    console.info(`[Constellation] Fetching all ${type} data for ${uri}`);
    
    const allDids: Set<string> = new Set();
    let cursor: string | undefined = undefined;

    try {
        do {
            const response = await fetchEngagementFromConstellation(uri, type, cursor);
            response.dids.forEach(did => allDids.add(did));
            cursor = response.cursor;
        } while (cursor);

        return Array.from(allDids);
    } catch (error) {
        console.error('[Constellation] Failed to fetch all engagement:', error);
        return Array.from(allDids); // Return what we have so far
    }
}