import { PUBLIC_ATPROTO_DID } from '$env/static/public';
import { cache } from './cache';
import { withFallback, resolveIdentity } from './agents';
import type {
	ProfileData,
	StatusData,
	SiteInfoData,
	LinkData,
	MusicStatusData,
	KibunStatusData,
	TangledRepo,
	TangledReposData
} from './types';
import { buildPdsBlobUrl } from './media';
import { findArtwork } from './musicbrainz';

/**
 * Fetches user profile from AT Protocol
 */
export async function fetchProfile(fetchFn?: typeof fetch): Promise<ProfileData> {
	console.info('[Profile] Fetching profile data');
	const cacheKey = `profile:${PUBLIC_ATPROTO_DID}`;
	const cached = cache.get<ProfileData>(cacheKey);
	if (cached) {
		console.debug('[Profile] Returning cached profile data');
		return cached;
	}

	try {
		console.info('[Profile] Cache miss, fetching from network');
		// Profile data is public, try Bluesky API first, then PDS
		const profile = await withFallback(
			PUBLIC_ATPROTO_DID,
			async (agent) => {
				console.debug('[Profile] Attempting profile fetch with agent:', agent.service.toString());
				const response = await agent.getProfile({ actor: PUBLIC_ATPROTO_DID });
				return response.data;
			},
			false,
			fetchFn
		);

		// Fetch the actual profile record to get pronouns and other fields
		// The profile view doesn't include pronouns, so we need the record
		let pronouns: string | undefined;
		try {
			console.debug('[Profile] Attempting to fetch profile record for pronouns');
			const recordResponse = await withFallback(
				PUBLIC_ATPROTO_DID,
				async (agent) => {
					const response = await agent.com.atproto.repo.getRecord({
						repo: PUBLIC_ATPROTO_DID,
						collection: 'app.bsky.actor.profile',
						rkey: 'self'
					});
					return response.data;
				},
				false,
				fetchFn
			);
			pronouns = (recordResponse.value as any).pronouns;
			console.debug('[Profile] Successfully fetched pronouns:', pronouns);
		} catch (error) {
			console.debug('[Profile] Could not fetch profile record for pronouns:', error);
			// Continue without pronouns if record fetch fails
		}

		const data: ProfileData = {
			did: profile.did,
			handle: profile.handle,
			displayName: profile.displayName,
			description: profile.description,
			avatar: profile.avatar,
			banner: profile.banner,
			followersCount: profile.followersCount,
			followsCount: profile.followsCount,
			postsCount: profile.postsCount,
			pronouns: pronouns
		};

		console.info('[Profile] Successfully fetched profile data');
		console.debug('[Profile] Profile data:', data);
		cache.set(cacheKey, data);
		return data;
	} catch (error) {
		console.error('[Profile] Failed to fetch profile from all sources:', error);
		throw error;
	}
}

/**
 * Fetches site information from custom lexicon
 */
export async function fetchSiteInfo(fetchFn?: typeof fetch): Promise<SiteInfoData | null> {
	const cacheKey = `siteinfo:${PUBLIC_ATPROTO_DID}`;
	const cached = cache.get<SiteInfoData>(cacheKey);
	if (cached) return cached;

	try {
		// Custom collection, prefer PDS first
		const result = await withFallback(
			PUBLIC_ATPROTO_DID,
			async (agent) => {
				try {
					const response = await agent.com.atproto.repo.getRecord({
						repo: PUBLIC_ATPROTO_DID,
						collection: 'uk.ewancroft.site.info',
						rkey: 'self'
					});
					return response.data;
				} catch (err: any) {
					// If record not found, return null instead of throwing
					if (err.error === 'RecordNotFound') {
						return null;
					}
					throw err;
				}
			},
			true,
			fetchFn
		); // usePDSFirst = true

		if (!result || !result.value) {
			return null;
		}

		const data = result.value as SiteInfoData;
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
export async function fetchLinks(fetchFn?: typeof fetch): Promise<LinkData | null> {
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
			true,
			fetchFn
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

/**
 * Fetches music listening status from custom lexicons
 * Checks both fm.teal.alpha.actor.status and fm.teal.alpha.feed.play collections
 */
export async function fetchMusicStatus(fetchFn?: typeof fetch): Promise<MusicStatusData | null> {
	console.info('[MusicStatus] Fetching music status data');
	const cacheKey = `music-status:${PUBLIC_ATPROTO_DID}`;
	const cached = cache.get<MusicStatusData>(cacheKey);
	if (cached) {
		console.debug('[MusicStatus] Returning cached music status data');
		return cached;
	}

	try {
		console.info('[MusicStatus] Cache miss, fetching from network');

		// Try the actor status collection first (shorter-lived status)
		try {
			const statusRecords = await withFallback(
				PUBLIC_ATPROTO_DID,
				async (agent) => {
					const response = await agent.com.atproto.repo.listRecords({
						repo: PUBLIC_ATPROTO_DID,
						collection: 'fm.teal.alpha.actor.status',
						limit: 1
					});
					return response.data.records;
				},
				true,
				fetchFn
			);

			if (statusRecords && statusRecords.length > 0) {
				const record = statusRecords[0];
				const value = record.value as any;

				// Check if status is still valid (not expired)
				if (value.expiry) {
					const expiryTime = parseInt(value.expiry) * 1000;
					if (Date.now() > expiryTime) {
						console.debug('[MusicStatus] Actor status expired, falling back to feed play');
					} else {
						// Build artwork URL - prioritize album art over individual track art
						let artworkUrl: string | undefined;
						const trackName = value.item?.trackName || value.trackName;
						const artists = value.item?.artists || value.artists || [];
						const releaseName = value.item?.releaseName || value.releaseName;
						const artistName = artists[0]?.artistName;
						const releaseMbId = value.item?.releaseMbId || value.releaseMbId;

						console.debug('[MusicStatus] Looking for artwork:', {
							trackName,
							artistName,
							releaseName,
							releaseMbId
						});

						// Priority 1: If we have album info, search for album art (more accurate)
						if (releaseName && artistName) {
							console.info('[MusicStatus] Prioritizing album artwork search');
							artworkUrl =
								(await findArtwork(releaseName, artistName, releaseName, releaseMbId, fetchFn)) ||
								undefined;
						}

						// Priority 2: Fall back to track-based search if album search failed
						if (!artworkUrl && trackName && artistName) {
							console.info('[MusicStatus] Falling back to track-based artwork search');
							artworkUrl =
								(await findArtwork(trackName, artistName, releaseName, releaseMbId, fetchFn)) ||
								undefined;
						}

						// Priority 3: Final fallback to atproto blob if no external artwork found
						if (!artworkUrl) {
							const artwork = value.item?.artwork || value.artwork;
							console.debug(
								'[MusicStatus] No external artwork found, checking atproto blob:',
								artwork
							);
							if (artwork?.ref?.$link) {
								const identity = await resolveIdentity(PUBLIC_ATPROTO_DID, fetchFn);
								artworkUrl = buildPdsBlobUrl(identity.pds, PUBLIC_ATPROTO_DID, artwork.ref.$link);
								console.info('[MusicStatus] Using atproto blob artwork URL:', artworkUrl);
							}
						}

						const data: MusicStatusData = {
							trackName: value.item?.trackName || value.trackName,
							artists: value.item?.artists || value.artists || [],
							releaseName: value.item?.releaseName || value.releaseName,
							playedTime: value.item?.playedTime || value.playedTime,
							originUrl: value.item?.originUrl || value.originUrl,
							recordingMbId: value.item?.recordingMbId || value.recordingMbId,
							releaseMbId: value.item?.releaseMbId || value.releaseMbId,
							isrc: value.isrc,
							duration: value.duration,
							musicServiceBaseDomain:
								value.item?.musicServiceBaseDomain || value.musicServiceBaseDomain,
							submissionClientAgent:
								value.item?.submissionClientAgent || value.submissionClientAgent,
							$type: 'fm.teal.alpha.actor.status',
							expiry: value.expiry,
							artwork: value.item?.artwork || value.artwork,
							artworkUrl
						};
						console.info('[MusicStatus] Successfully fetched actor status');
						cache.set(cacheKey, data);
						return data;
					}
				}
			}
		} catch (err) {
			console.debug('[MusicStatus] Actor status not found or error, trying feed play:', err);
		}

		// Fall back to feed play collection
		const playRecords = await withFallback(
			PUBLIC_ATPROTO_DID,
			async (agent) => {
				const response = await agent.com.atproto.repo.listRecords({
					repo: PUBLIC_ATPROTO_DID,
					collection: 'fm.teal.alpha.feed.play',
					limit: 1
				});
				return response.data.records;
			},
			true,
			fetchFn
		);

		if (playRecords && playRecords.length > 0) {
			const record = playRecords[0];
			const value = record.value as any;

			// Build artwork URL - prioritize album art over individual track art
			let artworkUrl: string | undefined;
			const trackName = value.trackName;
			const artists = value.artists || [];
			const releaseName = value.releaseName;
			const artistName = artists[0]?.artistName;
			const releaseMbId = value.releaseMbId;

			console.debug('[MusicStatus] Looking for artwork:', {
				trackName,
				artistName,
				releaseName,
				releaseMbId
			});

			// Priority 1: If we have album info, search for album art (more accurate)
			if (releaseName && artistName) {
				console.info('[MusicStatus] Prioritizing album artwork search');
				artworkUrl =
					(await findArtwork(releaseName, artistName, releaseName, releaseMbId, fetchFn)) ||
					undefined;
			}

			// Priority 2: Fall back to track-based search if album search failed
			if (!artworkUrl && trackName && artistName) {
				console.info('[MusicStatus] Falling back to track-based artwork search');
				artworkUrl =
					(await findArtwork(trackName, artistName, releaseName, releaseMbId, fetchFn)) ||
					undefined;
			}

			// Priority 3: Final fallback to atproto blob if no external artwork found
			if (!artworkUrl) {
				const artwork = value.artwork;
				console.debug('[MusicStatus] No external artwork found, checking atproto blob:', artwork);
				if (artwork?.ref?.$link) {
					const identity = await resolveIdentity(PUBLIC_ATPROTO_DID, fetchFn);
					artworkUrl = buildPdsBlobUrl(identity.pds, PUBLIC_ATPROTO_DID, artwork.ref.$link);
					console.info('[MusicStatus] Using atproto blob artwork URL:', artworkUrl);
				}
			}

			const data: MusicStatusData = {
				trackName: value.trackName,
				artists: value.artists || [],
				releaseName: value.releaseName,
				playedTime: value.playedTime,
				originUrl: value.originUrl,
				recordingMbId: value.recordingMbId,
				releaseMbId: value.releaseMbId,
				isrc: value.isrc,
				duration: value.duration,
				musicServiceBaseDomain: value.musicServiceBaseDomain,
				submissionClientAgent: value.submissionClientAgent,
				$type: 'fm.teal.alpha.feed.play',
				artwork: value.artwork,
				artworkUrl
			};
			console.info('[MusicStatus] Successfully fetched feed play');
			cache.set(cacheKey, data);
			return data;
		}

		return null;
	} catch (error) {
		console.error('[MusicStatus] Failed to fetch music status from all sources:', error);
		return null;
	}
}

/**
 * Fetches Kibun status from social.kibun.status collection
 */
export async function fetchKibunStatus(fetchFn?: typeof fetch): Promise<KibunStatusData | null> {
	console.info('[KibunStatus] Fetching kibun status data');
	const cacheKey = `kibun-status:${PUBLIC_ATPROTO_DID}`;
	const cached = cache.get<KibunStatusData>(cacheKey);
	if (cached) {
		console.debug('[KibunStatus] Returning cached kibun status data');
		return cached;
	}

	try {
		console.info('[KibunStatus] Cache miss, fetching from network');

		const statusRecords = await withFallback(
			PUBLIC_ATPROTO_DID,
			async (agent) => {
				const response = await agent.com.atproto.repo.listRecords({
					repo: PUBLIC_ATPROTO_DID,
					collection: 'social.kibun.status',
					limit: 1
				});
				return response.data.records;
			},
			true,
			fetchFn
		);

		if (statusRecords && statusRecords.length > 0) {
			const record = statusRecords[0];
			const value = record.value as any;

			const data: KibunStatusData = {
				text: value.text,
				emoji: value.emoji,
				createdAt: value.createdAt,
				$type: 'social.kibun.status'
			};

			console.info('[KibunStatus] Successfully fetched kibun status');
			cache.set(cacheKey, data);
			return data;
		}

		return null;
	} catch (error) {
		console.error('[KibunStatus] Failed to fetch kibun status from all sources:', error);
		return null;
	}
}

/**
 * Fetches Tangled repositories from AT Protocol
 */
export async function fetchTangledRepos(fetchFn?: typeof fetch): Promise<TangledReposData | null> {
	const cacheKey = `tangled:${PUBLIC_ATPROTO_DID}`;
	const cached = cache.get<TangledReposData>(cacheKey);
	if (cached) return cached;

	try {
		// Custom collection, prefer PDS first
		const records = await withFallback(
			PUBLIC_ATPROTO_DID,
			async (agent) => {
				const response = await agent.com.atproto.repo.listRecords({
					repo: PUBLIC_ATPROTO_DID,
					collection: 'sh.tangled.repo',
					limit: 100
				});
				return response.data.records;
			},
			true,
			fetchFn
		); // usePDSFirst = true

		if (records.length === 0) return null;

		const repos: TangledRepo[] = records.map((record) => {
			const value = record.value as any;
			return {
				uri: record.uri,
				name: value.name,
				description: value.description,
				knot: value.knot,
				createdAt: value.createdAt,
				labels: value.labels,
				source: value.source,
				spindle: value.spindle
			};
		});

		// Sort by creation date, newest first
		repos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

		const data: TangledReposData = { repos };
		cache.set(cacheKey, data);
		return data;
	} catch (error) {
		console.error('Failed to fetch Tangled repos from all sources:', error);
		return null;
	}
}
