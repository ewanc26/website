// Re-export types and functions from the AT Protocol service layer.
// Key API difference from the app's src/lib/services/atproto:
//   All functions that previously read PUBLIC_ATPROTO_DID from the environment
//   now accept `did: string` as their first argument.

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

export {
	fetchProfile,
	fetchSiteInfo,
	fetchLinks,
	fetchMusicStatus,
	fetchKibunStatus,
	fetchTangledRepos
} from './fetch';

export {
	fetchPublications,
	fetchDocuments,
	fetchRecentDocuments,
	fetchBlogPosts
} from './documents';

export { fetchLatestBlueskyPost, fetchPostFromUri } from './posts';

export { buildPdsBlobUrl, extractCidFromImageObject, extractImageUrlsFromValue } from './media';

export { createAgent, constellationAgent, defaultAgent, resolveIdentity, getPublicAgent, getPDSAgent, withFallback, resetAgents } from './agents';

export {
	searchMusicBrainzRelease,
	buildCoverArtUrl,
	searchiTunesArtwork,
	searchDeezerArtwork,
	searchLastFmArtwork,
	findArtwork
} from './musicbrainz';

export { fetchEngagementFromConstellation, fetchAllEngagement } from './engagement';

export { cache, ATProtoCache, CACHE_TTL } from './cache';

export { fetchAllRecords, fetchAllUserRecords } from './pagination';
export type { FetchRecordsConfig, AtProtoRecord } from './pagination';
