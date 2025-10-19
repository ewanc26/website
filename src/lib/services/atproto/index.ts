/**
 * Unified AT Protocol service exports
 * 
 * This module provides a clean API for interacting with AT Protocol services,
 * including profile data, blog posts, Bluesky posts, and custom lexicons.
 */

// Export all types
export type {
	ProfileData,
	StatusData,
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
	CacheEntry
} from './types';

// Export fetch functions
export { fetchProfile, fetchStatus, fetchSiteInfo, fetchLinks } from './fetch';

export {
	fetchBlogPosts,
	fetchLeafletPublications,
	fetchLatestBlueskyPost,
	fetchPostFromUri
} from './posts';

// Export utility functions
export { buildPdsBlobUrl, extractCidFromImageObject, extractImageUrlsFromValue } from './media';

export { resolveIdentity, withFallback, resetAgents } from './agents';

// Export cache for advanced use cases
export { cache, ATProtoCache } from './cache';
