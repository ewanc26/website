/**
 * Unified AT Protocol service exports
 *
 * This module provides a clean API for interacting with AT Protocol services,
 * focusing exclusively on Standard.site documents and publications.
 * Legacy platform support (WhiteWind, Leaflet) has been removed.
 */

// Export all types
export type {
	ProfileData,
	SiteInfoData,
	LinkData,
	LinkCard,
	BlueskyPost,
	BlogPost,
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
	MusicArtist,
	KibunStatusData,
	TangledRepo,
	TangledReposData,
	StandardSitePublication,
	StandardSitePublicationsData,
	StandardSiteDocument,
	StandardSiteDocumentsData,
	StandardSiteBasicTheme,
	StandardSiteThemeColor
} from './types';

// Export fetch functions
export {
	fetchProfile,
	fetchSiteInfo,
	fetchLinks,
	fetchMusicStatus,
	fetchKibunStatus,
	fetchTangledRepos
} from './fetch';

// Export Standard.site document functions
export {
	fetchPublications,
	fetchDocuments,
	fetchRecentDocuments,
	fetchBlogPosts
} from './documents';

// Export Bluesky post functions
export { fetchLatestBlueskyPost, fetchPostFromUri } from './posts';

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
