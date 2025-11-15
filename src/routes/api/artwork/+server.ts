/**
 * Server-side artwork fetching API endpoint
 * Solves CORS issues by proxying requests through the server
 * Includes intelligent caching to reduce external API calls
 */

import { json, error } from '@sveltejs/kit';
import { PUBLIC_SITE_URL, PUBLIC_SITE_TITLE } from '$env/static/public';
import type { RequestHandler } from './$types';

interface CacheEntry<T> {
	data: T;
	timestamp: number;
}

interface ArtworkResult {
	artworkUrl: string | null;
	source: string | null;
	mbId?: string;
}

/**
 * Simple in-memory cache for artwork lookups
 * Cache TTL: 1 hour (artwork URLs are stable)
 */
class ArtworkCache {
	private cache = new Map<string, CacheEntry<ArtworkResult>>();
	private readonly TTL = 60 * 60 * 1000; // 1 hour

	get(key: string): ArtworkResult | null {
		const entry = this.cache.get(key);
		if (!entry) return null;

		if (Date.now() - entry.timestamp > this.TTL) {
			this.cache.delete(key);
			return null;
		}

		console.log('[Artwork Cache] Hit:', key);
		return entry.data;
	}

	set(key: string, data: ArtworkResult): void {
		this.cache.set(key, {
			data,
			timestamp: Date.now()
		});
		console.log('[Artwork Cache] Set:', key);
	}
}

const artworkCache = new ArtworkCache();

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
}

interface iTunesSearchResponse {
	resultCount: number;
	results: iTunesResult[];
}

interface DeezerAlbum {
	cover_medium?: string;
	cover_big?: string;
	cover_xl?: string;
}

interface DeezerSearchResponse {
	data: DeezerAlbum[];
}

/**
 * Search MusicBrainz for release ID
 */
async function searchMusicBrainz(
	trackName: string,
	artistName: string,
	releaseName?: string
): Promise<string | null> {
	try {
		// Try by release name first if available
		if (releaseName) {
			const query = `release:"${releaseName}" AND artist:"${artistName}"`;
			const url = `https://musicbrainz.org/ws/2/release/?query=${encodeURIComponent(query)}&fmt=json&limit=5`;

			const response = await fetch(url, {
				headers: {
					'User-Agent': `${PUBLIC_SITE_TITLE}/1.0.0 (${PUBLIC_SITE_URL})`,
					Accept: 'application/json'
				}
			});

			if (response.ok) {
				const data: MusicBrainzSearchResponse = await response.json();
				if (data.releases?.[0]?.score >= 80) {
					return data.releases[0].id;
				}
			}
		}

		// Fallback to track name search
		const query = `recording:"${trackName}" AND artist:"${artistName}"`;
		const url = `https://musicbrainz.org/ws/2/release/?query=${encodeURIComponent(query)}&fmt=json&limit=5`;

		const response = await fetch(url, {
			headers: {
				'User-Agent': `${PUBLIC_SITE_TITLE}/1.0.0 (${PUBLIC_SITE_URL})`,
				Accept: 'application/json'
			}
		});

		if (response.ok) {
			const data: MusicBrainzSearchResponse = await response.json();
			if (data.releases?.[0]?.score >= 75) {
				return data.releases[0].id;
			}
		}
	} catch (err) {
		console.error('[MusicBrainz] Search failed:', err);
	}

	return null;
}

/**
 * Search iTunes for artwork
 */
async function searchiTunes(
	trackName: string,
	artistName: string,
	releaseName?: string
): Promise<string | null> {
	try {
		const searchTerm = releaseName
			? `${releaseName} ${artistName}`
			: `${trackName} ${artistName}`;

		const url = `https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&entity=album&limit=5`;

		const response = await fetch(url);
		if (!response.ok) return null;

		const data: iTunesSearchResponse = await response.json();

		if (data.results?.[0]?.artworkUrl100) {
			// Upscale to 600x600
			return data.results[0].artworkUrl100.replace('100x100', '600x600');
		}
	} catch (err) {
		console.error('[iTunes] Search failed:', err);
	}

	return null;
}

/**
 * Search Deezer for artwork (works server-side, no CORS issues)
 */
async function searchDeezer(
	trackName: string,
	artistName: string,
	releaseName?: string
): Promise<string | null> {
	try {
		const searchTerm = releaseName || trackName;
		const url = `https://api.deezer.com/search/album?q=artist:"${encodeURIComponent(artistName)}" album:"${encodeURIComponent(searchTerm)}"&limit=5`;

		const response = await fetch(url);
		if (!response.ok) return null;

		const data: DeezerSearchResponse = await response.json();

		if (data.data?.[0]) {
			const result = data.data[0];
			return result.cover_xl || result.cover_big || result.cover_medium || null;
		}
	} catch (err) {
		console.error('[Deezer] Search failed:', err);
	}

	return null;
}

/**
 * Search Last.fm for artwork
 */
async function searchLastFm(
	artistName: string,
	releaseName?: string
): Promise<string | null> {
	if (!releaseName) return null;

	try {
		const url = `https://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=8de8b91ab0c3f8d08a35c33bf0e0e803&artist=${encodeURIComponent(artistName)}&album=${encodeURIComponent(releaseName)}&format=json`;

		const response = await fetch(url);
		if (!response.ok) return null;

		const data: any = await response.json();

		if (data.album?.image) {
			const images = data.album.image;
			const largeImage =
				images.find((img: any) => img.size === 'extralarge') ||
				images.find((img: any) => img.size === 'large') ||
				images.find((img: any) => img.size === 'medium');

			return largeImage?.['#text'] || null;
		}
	} catch (err) {
		console.error('[Last.fm] Search failed:', err);
	}

	return null;
}

/**
 * GET /api/artwork
 * Query params: trackName, artistName, releaseName?, releaseMbId?
 * 
 * Features:
 * - Intelligent caching (1 hour TTL)
 * - Multiple fallback sources (MusicBrainz, iTunes, Deezer, Last.fm)
 * - HTTP caching headers for client-side caching
 */
export const GET: RequestHandler = async ({ url, setHeaders }) => {
	const trackName = url.searchParams.get('trackName');
	const artistName = url.searchParams.get('artistName');
	const releaseName = url.searchParams.get('releaseName') || undefined;
	const releaseMbId = url.searchParams.get('releaseMbId') || undefined;

	if (!trackName || !artistName) {
		throw error(400, 'Missing required parameters: trackName and artistName');
	}

	// Create cache key from parameters
	const cacheKey = `artwork:${trackName}:${artistName}:${releaseName || ''}:${releaseMbId || ''}`;

	// Check cache first
	const cachedResult = artworkCache.get(cacheKey);
	if (cachedResult) {
		// Set cache headers for successful cached responses
		if (cachedResult.artworkUrl) {
			setHeaders({
				'Cache-Control': 'public, max-age=3600', // 1 hour
				'CDN-Cache-Control': 'public, max-age=86400' // 24 hours for CDN
			});
		}
		return json(cachedResult);
	}

	console.log('[Artwork API] Request:', { trackName, artistName, releaseName, releaseMbId });

	let result: ArtworkResult;

	// If we have a MusicBrainz ID, use it directly
	if (releaseMbId) {
		const artworkUrl = `https://coverartarchive.org/release/${releaseMbId}/front-500`;
		result = {
			artworkUrl,
			source: 'musicbrainz-direct'
		};
		artworkCache.set(cacheKey, result);
		setHeaders({
			'Cache-Control': 'public, max-age=3600',
			'CDN-Cache-Control': 'public, max-age=86400'
		});
		return json(result);
	}

	// Try to find MusicBrainz ID
	const mbId = await searchMusicBrainz(trackName, artistName, releaseName);
	if (mbId) {
		const artworkUrl = `https://coverartarchive.org/release/${mbId}/front-500`;
		result = {
			artworkUrl,
			source: 'musicbrainz',
			mbId
		};
		artworkCache.set(cacheKey, result);
		setHeaders({
			'Cache-Control': 'public, max-age=3600',
			'CDN-Cache-Control': 'public, max-age=86400'
		});
		return json(result);
	}

	// Fallback to iTunes
	const iTunesUrl = await searchiTunes(trackName, artistName, releaseName);
	if (iTunesUrl) {
		result = {
			artworkUrl: iTunesUrl,
			source: 'itunes'
		};
		artworkCache.set(cacheKey, result);
		setHeaders({
			'Cache-Control': 'public, max-age=3600',
			'CDN-Cache-Control': 'public, max-age=86400'
		});
		return json(result);
	}

	// Fallback to Deezer (works server-side!)
	const deezerUrl = await searchDeezer(trackName, artistName, releaseName);
	if (deezerUrl) {
		result = {
			artworkUrl: deezerUrl,
			source: 'deezer'
		};
		artworkCache.set(cacheKey, result);
		setHeaders({
			'Cache-Control': 'public, max-age=3600',
			'CDN-Cache-Control': 'public, max-age=86400'
		});
		return json(result);
	}

	// Fallback to Last.fm
	const lastFmUrl = await searchLastFm(artistName, releaseName);
	if (lastFmUrl) {
		result = {
			artworkUrl: lastFmUrl,
			source: 'lastfm'
		};
		artworkCache.set(cacheKey, result);
		setHeaders({
			'Cache-Control': 'public, max-age=3600',
			'CDN-Cache-Control': 'public, max-age=86400'
		});
		return json(result);
	}

	// No artwork found - cache negative result with shorter TTL
	result = {
		artworkUrl: null,
		source: null
	};
	artworkCache.set(cacheKey, result);
	setHeaders({
		'Cache-Control': 'public, max-age=300' // 5 minutes for not found
	});
	return json(result);
};
