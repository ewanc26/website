/**
 * Type definitions for AT Protocol services
 */

export interface ProfileData {
	did: string;
	handle: string;
	displayName?: string;
	description?: string;
	avatar?: string;
	banner?: string;
	followersCount?: number;
	followsCount?: number;
	postsCount?: number;
	pronouns?: string;
}

export interface StatusData {
	text: string;
	createdAt: string;
}

export interface Technology {
	name: string;
	url?: string;
	description?: string;
}

export interface License {
	name: string;
	url?: string;
}

export interface BasedOnItem {
	section?: string;
	name?: string;
	url?: string;
	description?: string;
	type?: string;
}

export interface RelatedService {
	section?: string;
	name?: string;
	url?: string;
	description?: string;
	relationship?: string;
}

export interface Repository {
	platform?: string;
	url: string;
	type?: string;
	description?: string;
}

export interface Credit {
	section?: string;
	name?: string;
	type: string;
	url?: string;
	author?: string;
	license?: License;
	description?: string;
}

export interface SectionLicense {
	section?: string;
	name?: string;
	url?: string;
}

export interface SiteInfoData {
	technologyStack?: Technology[];
	privacyStatement?: string;
	openSourceInfo?: {
		description?: string;
		license?: License;
		basedOn?: BasedOnItem[];
		relatedServices?: RelatedService[];
		repositories?: Repository[];
	};
	credits?: Credit[];
	additionalInfo?: {
		websiteBirthYear?: number;
		purpose?: string;
		sectionLicense?: SectionLicense[];
	};
}

export interface LinkCard {
	url: string;
	text: string;
	emoji: string;
}

export interface LinkData {
	cards: LinkCard[];
}

export interface BlogPost {
	title: string;
	url: string;
	createdAt: string;
	platform: 'standard.site';
	description?: string;
	rkey: string;
	publicationName?: string;
	publicationRkey?: string;
	tags?: string[];
	// Standard.site specific fields
	coverImage?: string;
	textContent?: string;
	updatedAt?: string;
}

export interface BlogPostsData {
	posts: BlogPost[];
}

export interface Facet {
	index: {
		byteStart: number;
		byteEnd: number;
	};
	features: Array<{
		$type: string;
		uri?: string;
		did?: string;
		tag?: string;
	}>;
}

export interface ExternalLink {
	uri: string;
	title: string;
	description?: string;
	thumb?: string;
}

export interface PostAuthor {
	did: string;
	handle: string;
	displayName?: string;
	avatar?: string;
	pronouns?: string;
}

export interface BlueskyPost {
	text: string;
	createdAt: string;
	uri: string;
	author: PostAuthor;
	likeCount?: number;
	repostCount?: number;
	replyCount?: number;
	hasImages: boolean;
	imageUrls?: string[];
	imageAlts?: string[];
	hasVideo?: boolean;
	videoUrl?: string;
	videoThumbnail?: string;
	quotedPostUri?: string;
	quotedPost?: BlueskyPost;
	facets?: Facet[];
	externalLink?: ExternalLink;
	// Reply context
	replyParent?: BlueskyPost;
	replyRoot?: BlueskyPost;
	// Repost context
	isRepost?: boolean;
	repostAuthor?: PostAuthor;
	repostCreatedAt?: string;
	originalPost?: BlueskyPost;
}

export interface ResolvedIdentity {
	did: string;
	pds: string;
}

export interface CacheEntry<T> {
	data: T;
	timestamp: number;
}

export interface MusicArtist {
	artistName: string;
	artistMbId?: string;
}

export interface MusicStatusData {
	trackName: string;
	artists: MusicArtist[];
	releaseName?: string;
	playedTime: string;
	originUrl?: string;
	recordingMbId?: string;
	releaseMbId?: string;
	isrc?: string;
	duration?: number;
	musicServiceBaseDomain?: string;
	submissionClientAgent?: string;
	$type: 'fm.teal.alpha.actor.status' | 'fm.teal.alpha.feed.play';
	expiry?: string;
	artwork?: {
		ref?: { $link: string };
		mimeType?: string;
		size?: number;
	};
	artworkUrl?: string; // Computed URL for display
}

export interface KibunStatusData {
	text: string;
	emoji: string;
	createdAt: string;
	$type: 'social.kibun.status';
}

export interface TangledRepo {
	uri: string;
	name: string;
	description?: string;
	knot: string;
	createdAt: string;
	labels?: string[];
	source?: string;
	spindle?: string;
}

export interface TangledReposData {
	repos: TangledRepo[];
}

// Standard.site types
export interface StandardSiteThemeColor {
	r: number;
	g: number;
	b: number;
	a?: number;
}

export interface StandardSiteBasicTheme {
	background: StandardSiteThemeColor;
	foreground: StandardSiteThemeColor;
	accent: StandardSiteThemeColor;
	accentForeground: StandardSiteThemeColor;
}

export interface StandardSitePublication {
	name: string;
	rkey: string;
	uri: string;
	url: string;
	description?: string;
	icon?: string;
	basicTheme?: StandardSiteBasicTheme;
	preferences?: {
		showInDiscover?: boolean;
	};
}

export interface StandardSitePublicationsData {
	publications: StandardSitePublication[];
}

export interface StandardSiteDocument {
	title: string;
	rkey: string;
	uri: string;
	url: string;
	site: string;
	path?: string;
	description?: string;
	coverImage?: string;
	content?: any;
	textContent?: string;
	bskyPostRef?: {
		uri: string;
		cid: string;
	};
	tags?: string[];
	publishedAt: string;
	updatedAt?: string;
	publicationName?: string;
	publicationRkey?: string;
}

export interface StandardSiteDocumentsData {
	documents: StandardSiteDocument[];
}
