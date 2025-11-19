/**
 * Music artwork fetching with multiple API-free sources
 * Cascading fallback: MusicBrainz → iTunes → Deezer → Spotify
 */

import { cache } from './cache';

interface MusicBrainzRelease {
	id: string;
	score: number;
	title: string;
	'artist-credit'?: Array<{ name: string }>;
}

interface MusicBrainzSearchResponse {
	releases: MusicBrainzRelease[];
}

interface iTunesResult {
	artworkUrl100?: string;
	artworkUrl60?: string;
	collectionId?: number;
}

interface iTunesSearchResponse {
	resultCount: number;
	results: iTunesResult[];
}

interface DeezerAlbum {
	id: number;
	title: string;
	cover_medium?: string;
	cover_big?: string;
	cover_xl?: string;
}

interface DeezerSearchResponse {
	data: DeezerAlbum[];
}

/**
 * Search MusicBrainz for a release by track name and artist
 * Now tries both track-based and album-based searches
 */
export async function searchMusicBrainzRelease(
	trackName: string,
	artistName: string,
	releaseName?: string
): Promise<string | null> {
	const cacheKey = `mb:release:${trackName}:${artistName}:${releaseName || 'none'}`;
	const cached = cache.get<string | null>(cacheKey);
	if (cached !== null) {
		console.debug('[MusicBrainz] Returning cached release ID:', cached);
		return cached;
	}

	try {
		// Strategy 1: Search by release name if available (most accurate)
		if (releaseName) {
			const releaseResult = await searchByReleaseName(releaseName, artistName);
			if (releaseResult) {
				cache.set(cacheKey, releaseResult);
				return releaseResult;
			}
		}

		// Strategy 2: Search by track name
		const trackResult = await searchByTrackName(trackName, artistName);
		if (trackResult) {
			cache.set(cacheKey, trackResult);
			return trackResult;
		}

		// Cache null result to avoid repeated failed lookups
		console.debug('[MusicBrainz] No release found for:', { trackName, artistName, releaseName });
		cache.set(cacheKey, null);
		return null;
	} catch (error) {
		console.error('[MusicBrainz] Search error:', error);
		return null;
	}
}

async function searchByReleaseName(
	releaseName: string,
	artistName: string
): Promise<string | null> {
	try {
		const query = `release:"${releaseName}" AND artist:"${artistName}"`;
		const url = `https://musicbrainz.org/ws/2/release/?query=${encodeURIComponent(query)}&fmt=json&limit=5`;

		console.info('[MusicBrainz] Searching by release name:', { releaseName, artistName });

		const response = await fetch(url, {
			headers: {
				'User-Agent': 'ewancroft.uk/1.0.0 (https://ewancroft.uk)',
				Accept: 'application/json'
			}
		});

		if (!response.ok) return null;

		const data: MusicBrainzSearchResponse = await response.json();

		if (!data.releases || data.releases.length === 0) return null;

		const bestMatch = data.releases[0];
		if (bestMatch.score < 80) {
			console.debug('[MusicBrainz] Release search score too low:', bestMatch.score);
			return null;
		}

		console.info('[MusicBrainz] Found release by album:', {
			id: bestMatch.id,
			title: bestMatch.title,
			score: bestMatch.score
		});

		return bestMatch.id;
	} catch (error) {
		console.debug('[MusicBrainz] Release name search failed:', error);
		return null;
	}
}

async function searchByTrackName(trackName: string, artistName: string): Promise<string | null> {
	try {
		const query = `recording:"${trackName}" AND artist:"${artistName}"`;
		const url = `https://musicbrainz.org/ws/2/release/?query=${encodeURIComponent(query)}&fmt=json&limit=5`;

		console.info('[MusicBrainz] Searching by track name:', { trackName, artistName });

		const response = await fetch(url, {
			headers: {
				'User-Agent': 'ewancroft.uk/1.0.0 (https://ewancroft.uk)',
				Accept: 'application/json'
			}
		});

		if (!response.ok) return null;

		const data: MusicBrainzSearchResponse = await response.json();

		if (!data.releases || data.releases.length === 0) return null;

		const bestMatch = data.releases[0];
		if (bestMatch.score < 75) {
			console.debug('[MusicBrainz] Track search score too low:', bestMatch.score);
			return null;
		}

		console.info('[MusicBrainz] Found release by track:', {
			id: bestMatch.id,
			title: bestMatch.title,
			score: bestMatch.score
		});

		return bestMatch.id;
	} catch (error) {
		console.debug('[MusicBrainz] Track name search failed:', error);
		return null;
	}
}

/**
 * Search iTunes for album artwork (no API key required)
 */
export async function searchiTunesArtwork(
	trackName: string,
	artistName: string,
	releaseName?: string
): Promise<string | null> {
	const cacheKey = `itunes:artwork:${trackName}:${artistName}:${releaseName || 'none'}`;
	const cached = cache.get<string | null>(cacheKey);
	if (cached !== null) {
		console.debug('[iTunes] Returning cached artwork URL:', cached);
		return cached;
	}

	try {
		// Prefer searching by album + artist for better accuracy
		const searchTerm = releaseName ? `${releaseName} ${artistName}` : `${trackName} ${artistName}`;

		const url = `https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&entity=album&limit=5`;

		console.info('[iTunes] Searching for artwork:', { searchTerm });

		const response = await fetch(url);
		if (!response.ok) {
			cache.set(cacheKey, null);
			return null;
		}

		const data: iTunesSearchResponse = await response.json();

		if (!data.results || data.results.length === 0) {
			console.debug('[iTunes] No results found');
			cache.set(cacheKey, null);
			return null;
		}

		// Get the highest resolution artwork available
		const result = data.results[0];
		let artworkUrl = result.artworkUrl100;

		if (artworkUrl) {
			// iTunes allows upsizing artwork by modifying the URL
			// Replace 100x100 with 600x600 for better quality
			artworkUrl = artworkUrl.replace('100x100', '600x600');
			console.info('[iTunes] Found artwork:', artworkUrl);
			cache.set(cacheKey, artworkUrl);
			return artworkUrl;
		}

		cache.set(cacheKey, null);
		return null;
	} catch (error) {
		console.error('[iTunes] Search error:', error);
		return null;
	}
}

/**
 * Search Deezer for album artwork (no API key required)
 * Note: Deezer API has CORS restrictions, so this may not work in all browsers
 */
export async function searchDeezerArtwork(
	trackName: string,
	artistName: string,
	releaseName?: string
): Promise<string | null> {
	const cacheKey = `deezer:artwork:${trackName}:${artistName}:${releaseName || 'none'}`;
	const cached = cache.get<string | null>(cacheKey);
	if (cached !== null) {
		console.debug('[Deezer] Returning cached artwork URL:', cached);
		return cached;
	}

	try {
		// Prefer album search if available
		const searchTerm = releaseName || trackName;
		// Use CORS proxy or skip Deezer due to CORS restrictions
		const url = `https://api.deezer.com/search/album?q=artist:"${encodeURIComponent(artistName)}" album:"${encodeURIComponent(searchTerm)}"&limit=5&output=jsonp`;

		console.info('[Deezer] Searching for artwork:', { searchTerm, artistName });

		const response = await fetch(url);
		if (!response.ok) {
			cache.set(cacheKey, null);
			return null;
		}

		const data: DeezerSearchResponse = await response.json();

		if (!data.data || data.data.length === 0) {
			console.debug('[Deezer] No results found');
			cache.set(cacheKey, null);
			return null;
		}

		// Use the highest quality artwork available
		const result = data.data[0];
		const artworkUrl = result.cover_xl || result.cover_big || result.cover_medium;

		if (artworkUrl) {
			console.info('[Deezer] Found artwork:', artworkUrl);
			cache.set(cacheKey, artworkUrl);
			return artworkUrl;
		}

		cache.set(cacheKey, null);
		return null;
	} catch (error) {
		// Deezer has CORS issues, so we'll skip it silently
		console.debug('[Deezer] Skipped due to CORS restrictions');
		cache.set(cacheKey, null);
		return null;
	}
}

/**
 * Build MusicBrainz Cover Art Archive URL
 */
export function buildCoverArtUrl(releaseMbId: string, size: 250 | 500 | 1200 = 500): string {
	return `https://coverartarchive.org/release/${releaseMbId}/front-${size}`;
}

/**
 * Search Last.fm for album artwork (no API key required for album art)
 * Uses Last.fm's direct image URLs based on artist and album
 */
export async function searchLastFmArtwork(
	trackName: string,
	artistName: string,
	releaseName?: string
): Promise<string | null> {
	const cacheKey = `lastfm:artwork:${trackName}:${artistName}:${releaseName || 'none'}`;
	const cached = cache.get<string | null>(cacheKey);
	if (cached !== null) {
		console.debug('[Last.fm] Returning cached artwork URL:', cached);
		return cached;
	}

	if (!releaseName) {
		return null; // Last.fm method needs album name
	}

	try {
		// Last.fm has a public API for album info without authentication
		const url = `https://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=8de8b91ab0c3f8d08a35c33bf0e0e803&artist=${encodeURIComponent(artistName)}&album=${encodeURIComponent(releaseName)}&format=json`;

		console.info('[Last.fm] Searching for artwork:', { artistName, releaseName });

		const response = await fetch(url);
		if (!response.ok) {
			cache.set(cacheKey, null);
			return null;
		}

		const data: any = await response.json();

		if (!data.album?.image) {
			console.debug('[Last.fm] No artwork found');
			cache.set(cacheKey, null);
			return null;
		}

		// Get the largest image available
		const images = data.album.image;
		const largeImage =
			images.find((img: any) => img.size === 'extralarge') ||
			images.find((img: any) => img.size === 'large') ||
			images.find((img: any) => img.size === 'medium');

		if (largeImage?.['#text']) {
			const artworkUrl = largeImage['#text'];
			console.info('[Last.fm] Found artwork:', artworkUrl);
			cache.set(cacheKey, artworkUrl);
			return artworkUrl;
		}

		cache.set(cacheKey, null);
		return null;
	} catch (error) {
		console.debug('[Last.fm] Search error:', error);
		cache.set(cacheKey, null);
		return null;
	}
}

/**
 * Cascading artwork search using server-side API endpoint
 * This solves CORS issues by proxying requests through our server
 * Tries: MusicBrainz → iTunes → Deezer → Last.fm
 */
export async function findArtwork(
	trackName: string,
	artistName: string,
	releaseName?: string,
	releaseMbId?: string
): Promise<string | null> {
	try {
		// Build query parameters
		const params = new URLSearchParams({
			trackName,
			artistName
		});

		if (releaseName) params.set('releaseName', releaseName);
		if (releaseMbId) params.set('releaseMbId', releaseMbId);

		console.info('[Artwork] Fetching via server API:', {
			trackName,
			artistName,
			releaseName,
			releaseMbId
		});

		// Call our server-side API endpoint
		const response = await fetch(`/api/artwork?${params.toString()}`);

		if (!response.ok) {
			console.error('[Artwork] API request failed:', response.status);
			return null;
		}

		const data = await response.json();

		if (data.artworkUrl) {
			console.info('[Artwork] Found via', data.source, ':', data.artworkUrl);
			return data.artworkUrl;
		}

		console.warn('[Artwork] No artwork found from any source');
		return null;
	} catch (error) {
		console.error('[Artwork] Server API error:', error);
		return null;
	}
}
