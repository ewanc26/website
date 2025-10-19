import { PUBLIC_ATPROTO_DID } from '$env/static/public';
import { cache } from './cache';
import { withFallback } from './agents';
import type { ProfileData, StatusData, SiteInfoData, LinkData } from './types';

/**
 * Fetches user profile from AT Protocol
 */
export async function fetchProfile(): Promise<ProfileData> {
	const cacheKey = `profile:${PUBLIC_ATPROTO_DID}`;
	const cached = cache.get<ProfileData>(cacheKey);
	if (cached) return cached;

	try {
		// Profile data is public, try Bluesky API first, then PDS
		const profile = await withFallback(PUBLIC_ATPROTO_DID, async (agent) => {
			const response = await agent.getProfile({ actor: PUBLIC_ATPROTO_DID });
			return response.data;
		});

		const data: ProfileData = {
			did: profile.did,
			handle: profile.handle,
			displayName: profile.displayName,
			description: profile.description,
			avatar: profile.avatar,
			banner: profile.banner,
			followersCount: profile.followersCount,
			followsCount: profile.followsCount,
			postsCount: profile.postsCount
		};

		cache.set(cacheKey, data);
		return data;
	} catch (error) {
		console.error('Failed to fetch profile from all sources:', error);
		throw error;
	}
}

/**
 * Fetches user status from custom lexicon
 */
export async function fetchStatus(): Promise<StatusData | null> {
	const cacheKey = `status:${PUBLIC_ATPROTO_DID}`;
	const cached = cache.get<StatusData>(cacheKey);
	if (cached) return cached;

	try {
		// Custom collection, prefer PDS first
		const records = await withFallback(
			PUBLIC_ATPROTO_DID,
			async (agent) => {
				const response = await agent.com.atproto.repo.listRecords({
					repo: PUBLIC_ATPROTO_DID,
					collection: 'uk.ewancroft.now',
					limit: 1
				});
				return response.data.records;
			},
			true
		); // usePDSFirst = true

		if (records.length === 0) return null;

		const record = records[0];
		const data: StatusData = {
			text: (record.value as any).text,
			createdAt: (record.value as any).createdAt
		};

		cache.set(cacheKey, data);
		return data;
	} catch (error) {
		console.error('Failed to fetch status from all sources:', error);
		return null;
	}
}

/**
 * Fetches site information from custom lexicon
 */
export async function fetchSiteInfo(): Promise<SiteInfoData | null> {
	const cacheKey = `siteinfo:${PUBLIC_ATPROTO_DID}`;
	const cached = cache.get<SiteInfoData>(cacheKey);
	if (cached) return cached;

	try {
		// Custom collection, prefer PDS first
		const value = await withFallback(
			PUBLIC_ATPROTO_DID,
			async (agent) => {
				const response = await agent.com.atproto.repo.getRecord({
					repo: PUBLIC_ATPROTO_DID,
					collection: 'uk.ewancroft.site.info',
					rkey: 'self'
				});
				return response.data.value;
			},
			true
		); // usePDSFirst = true

		const data = value as SiteInfoData;
		cache.set(cacheKey, data);
		return data;
	} catch (error) {
		console.error('Failed to fetch site info from all sources:', error);
		return null;
	}
}

/**
 * Fetches links from Linkat board
 */
export async function fetchLinks(): Promise<LinkData | null> {
	const cacheKey = `links:${PUBLIC_ATPROTO_DID}`;
	const cached = cache.get<LinkData>(cacheKey);
	if (cached) return cached;

	try {
		// Custom collection, prefer PDS first
		const value = await withFallback(
			PUBLIC_ATPROTO_DID,
			async (agent) => {
				const response = await agent.com.atproto.repo.getRecord({
					repo: PUBLIC_ATPROTO_DID,
					collection: 'blue.linkat.board',
					rkey: 'self'
				});
				return response.data.value;
			},
			true
		); // usePDSFirst = true

		// Validate the response has the expected structure
		if (!value || !Array.isArray((value as any).cards)) {
			return null;
		}

		const data: LinkData = {
			cards: (value as any).cards
		};

		cache.set(cacheKey, data);
		return data;
	} catch (error) {
		console.error('Failed to fetch links from all sources:', error);
		return null;
	}
}
