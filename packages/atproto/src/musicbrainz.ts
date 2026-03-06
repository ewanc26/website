import { cache } from './cache.js';

interface MusicBrainzRelease {
	id: string;
	score: number;
	title: string;
}

interface MusicBrainzSearchResponse {
	releases: MusicBrainzRelease[];
}

interface iTunesSearchResponse {
	resultCount: number;
	results: Array<{ artworkUrl100?: string }>;
}

export async function searchMusicBrainzRelease(
	trackName: string,
	artistName: string,
	releaseName?: string
): Promise<string | null> {
	const cacheKey = `mb:release:${trackName}:${artistName}:${releaseName || 'none'}`;
	const cached = cache.get<string | null>(cacheKey);
	if (cached !== null) return cached;

	try {
		if (releaseName) {
			const result = await searchByReleaseName(releaseName, artistName);
			if (result) { cache.set(cacheKey, result); return result; }
		}
		const result = await searchByTrackName(trackName, artistName);
		if (result) { cache.set(cacheKey, result); return result; }
		cache.set(cacheKey, null);
		return null;
	} catch {
		return null;
	}
}

async function searchByReleaseName(releaseName: string, artistName: string): Promise<string | null> {
	try {
		const query = `release:"${releaseName}" AND artist:"${artistName}"`;
		const url = `https://musicbrainz.org/ws/2/release/?query=${encodeURIComponent(query)}&fmt=json&limit=5`;
		const response = await fetch(url, {
			headers: { 'User-Agent': 'ewancroft.uk/1.0.0 (https://ewancroft.uk)', Accept: 'application/json' }
		});
		if (!response.ok) return null;
		const data: MusicBrainzSearchResponse = await response.json();
		if (!data.releases?.length) return null;
		const best = data.releases[0];
		if (best.score < 80) return null;
		return best.id;
	} catch { return null; }
}

async function searchByTrackName(trackName: string, artistName: string): Promise<string | null> {
	try {
		const query = `recording:"${trackName}" AND artist:"${artistName}"`;
		const url = `https://musicbrainz.org/ws/2/release/?query=${encodeURIComponent(query)}&fmt=json&limit=5`;
		const response = await fetch(url, {
			headers: { 'User-Agent': 'ewancroft.uk/1.0.0 (https://ewancroft.uk)', Accept: 'application/json' }
		});
		if (!response.ok) return null;
		const data: MusicBrainzSearchResponse = await response.json();
		if (!data.releases?.length) return null;
		const best = data.releases[0];
		if (best.score < 75) return null;
		return best.id;
	} catch { return null; }
}

export function buildCoverArtUrl(releaseMbId: string, size: 250 | 500 | 1200 = 500): string {
	return `https://coverartarchive.org/release/${releaseMbId}/front-${size}`;
}

export async function searchiTunesArtwork(
	trackName: string,
	artistName: string,
	releaseName?: string
): Promise<string | null> {
	const cacheKey = `itunes:artwork:${trackName}:${artistName}:${releaseName || 'none'}`;
	const cached = cache.get<string | null>(cacheKey);
	if (cached !== null) return cached;

	try {
		const searchTerm = releaseName ? `${releaseName} ${artistName}` : `${trackName} ${artistName}`;
		const url = `https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&entity=album&limit=5`;
		const response = await fetch(url);
		if (!response.ok) { cache.set(cacheKey, null); return null; }
		const data: iTunesSearchResponse = await response.json();
		if (!data.results?.length) { cache.set(cacheKey, null); return null; }
		let artworkUrl = data.results[0].artworkUrl100;
		if (artworkUrl) {
			artworkUrl = artworkUrl.replace('100x100', '600x600');
			cache.set(cacheKey, artworkUrl);
			return artworkUrl;
		}
		cache.set(cacheKey, null);
		return null;
	} catch {
		return null;
	}
}

export async function searchDeezerArtwork(
	trackName: string,
	artistName: string,
	releaseName?: string
): Promise<string | null> {
	// Deezer has CORS restrictions in browsers — skip silently
	return null;
}

export async function searchLastFmArtwork(
	trackName: string,
	artistName: string,
	releaseName?: string
): Promise<string | null> {
	if (!releaseName) return null;

	const cacheKey = `lastfm:artwork:${trackName}:${artistName}:${releaseName}`;
	const cached = cache.get<string | null>(cacheKey);
	if (cached !== null) return cached;

	try {
		const url = `https://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=8de8b91ab0c3f8d08a35c33bf0e0e803&artist=${encodeURIComponent(artistName)}&album=${encodeURIComponent(releaseName)}&format=json`;
		const response = await fetch(url);
		if (!response.ok) { cache.set(cacheKey, null); return null; }
		const data: any = await response.json();
		if (!data.album?.image) { cache.set(cacheKey, null); return null; }
		const images = data.album.image;
		const largeImage =
			images.find((img: any) => img.size === 'extralarge') ||
			images.find((img: any) => img.size === 'large') ||
			images.find((img: any) => img.size === 'medium');
		if (largeImage?.['#text']) {
			cache.set(cacheKey, largeImage['#text']);
			return largeImage['#text'];
		}
		cache.set(cacheKey, null);
		return null;
	} catch {
		return null;
	}
}

/**
 * Cascading artwork search: Cover Art Archive → MusicBrainz+CAA → iTunes → Last.fm
 */
export async function findArtwork(
	trackName: string,
	artistName: string,
	releaseName?: string,
	releaseMbId?: string,
	fetchFn?: typeof fetch
): Promise<string | null> {
	const _fetch = fetchFn || globalThis.fetch;

	// 1. Try Cover Art Archive with known MBID
	if (releaseMbId) {
		const caaUrl = buildCoverArtUrl(releaseMbId, 500);
		try {
			const res = await _fetch(caaUrl, { method: 'HEAD' });
			if (res.ok) return caaUrl;
		} catch { /* continue */ }
	}

	// 2. Search MusicBrainz for MBID, then try CAA
	const mbId = await searchMusicBrainzRelease(trackName, artistName, releaseName);
	if (mbId) {
		const caaUrl = buildCoverArtUrl(mbId, 500);
		try {
			const res = await _fetch(caaUrl, { method: 'HEAD' });
			if (res.ok) return caaUrl;
		} catch { /* continue */ }
	}

	// 3. Try iTunes
	const iTunesUrl = await searchiTunesArtwork(trackName, artistName, releaseName);
	if (iTunesUrl) return iTunesUrl;

	// 4. Try Last.fm
	const lastFmUrl = await searchLastFmArtwork(trackName, artistName, releaseName);
	if (lastFmUrl) return lastFmUrl;

	return null;
}
