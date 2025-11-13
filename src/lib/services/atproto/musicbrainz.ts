/**
 * MusicBrainz API helpers for looking up missing metadata
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

/**
 * Search MusicBrainz for a release by track name and artist
 * Uses conservative matching to avoid false positives
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
		// Build search query - prefer release name if available
		const searchTerm = releaseName || trackName;
		const query = `release:"${searchTerm}" AND artist:"${artistName}"`;
		const url = `https://musicbrainz.org/ws/2/release/?query=${encodeURIComponent(query)}&fmt=json&limit=5`;

		console.info('[MusicBrainz] Searching for:', { trackName, artistName, releaseName });

		const response = await fetch(url, {
			headers: {
				'User-Agent': 'ewancroft.uk/1.0.0 (https://ewancroft.uk)',
				'Accept': 'application/json'
			}
		});

		if (!response.ok) {
			console.warn('[MusicBrainz] Search failed:', response.status);
			// Cache null result to avoid repeated failed lookups
			cache.set(cacheKey, null);
			return null;
		}

		const data: MusicBrainzSearchResponse = await response.json();

		if (!data.releases || data.releases.length === 0) {
			console.debug('[MusicBrainz] No releases found');
			cache.set(cacheKey, null);
			return null;
		}

		// Take the first result with a decent score (MusicBrainz uses 0-100 scale)
		// We want a score of at least 80 to be reasonably confident
		const bestMatch = data.releases[0];
		if (bestMatch.score < 80) {
			console.debug('[MusicBrainz] Best match score too low:', bestMatch.score);
			cache.set(cacheKey, null);
			return null;
		}

		console.info('[MusicBrainz] Found release:', {
			id: bestMatch.id,
			title: bestMatch.title,
			artist: bestMatch['artist-credit']?.[0]?.name,
			score: bestMatch.score
		});

		// Cache for 24 hours (longer than normal cache since MB IDs don't change)
		cache.set(cacheKey, bestMatch.id);
		return bestMatch.id;
	} catch (error) {
		console.error('[MusicBrainz] Search error:', error);
		// Don't cache errors - allow retry on next fetch
		return null;
	}
}

/**
 * Build MusicBrainz Cover Art Archive URL
 */
export function buildCoverArtUrl(releaseMbId: string, size: 250 | 500 | 1200 = 500): string {
	return `https://coverartarchive.org/release/${releaseMbId}/front-${size}`;
}
