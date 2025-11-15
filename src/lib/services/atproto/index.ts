/**
 * Unified AT Protocol service exports
 * 
 * This module provides a clean API for interacting with AT Protocol services,
 * including profile data, blog posts, Bluesky posts, and custom lexicons.
 */

// Export all types
export type {
	ProfileData,
	SiteInfoData,
	LinkData,
	LinkCard,
	BlogPost,
	BlogPostsData,
	LeafletPublication,
	LeafletPublicationsData,
	BlueskyPost,
	PostAuthor,
	ExternalLink,
	Facet,
	Technology,
	License,
	BasedOnItem,
	RelatedService,
	Repository,
	Credit,
	SectionLicense,
	ResolvedIdentity,
	CacheEntry,
	MusicStatusData,
	MusicArtist
} from './types';

export type { TangledRepo, TangledReposData } from './tangled';

// Export fetch functions
export { fetchProfile, fetchSiteInfo, fetchLinks, fetchMusicStatus } from './fetch';

export { fetchTangledRepos } from './tangled';

export {
	fetchBlogPosts,
	fetchLeafletPublications,
	fetchLatestBlueskyPost,
	fetchPostFromUri
} from './posts';

// Export utility functions
export { buildPdsBlobUrl, extractCidFromImageObject, extractImageUrlsFromValue } from './media';

export { resolveIdentity, withFallback, resetAgents } from './agents';

export { 
	searchMusicBrainzRelease, 
	buildCoverArtUrl, 
	searchiTunesArtwork,
	searchDeezerArtwork,
	searchLastFmArtwork,
	findArtwork 
} from './musicbrainz';

// Export cache for advanced use cases
export { cache, ATProtoCache } from './cache';
