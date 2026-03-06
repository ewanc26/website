// Re-export all types from @ewanc26/atproto.
// The app's service wrappers use these directly.
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
} from '@ewanc26/atproto';

// StatusData is app-local (not in the package) — keep it here.
export interface StatusData {
	text: string;
	createdAt: string;
}

// BlogPostsData is also app-local.
export interface BlogPostsData {
	posts: import('@ewanc26/atproto').BlogPost[];
}
