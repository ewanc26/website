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
	platform: 'WhiteWind' | 'leaflet';
	description?: string;
	rkey: string;
	publicationName?: string;
	publicationRkey?: string;
}

export interface BlogPostsData {
	posts: BlogPost[];
}

export interface LeafletPublication {
	name: string;
	rkey: string;
	uri: string;
	basePath?: string;
	description?: string;
	icon?: string;
}

export interface LeafletPublicationsData {
	publications: LeafletPublication[];
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
}

export interface ResolvedIdentity {
	did: string;
	pds: string;
}

export interface CacheEntry<T> {
	data: T;
	timestamp: number;
}
