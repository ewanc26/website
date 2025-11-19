import { ogImages } from '$lib/helper/ogImages';
import {
	PUBLIC_SITE_TITLE,
	PUBLIC_SITE_DESCRIPTION,
	PUBLIC_SITE_KEYWORDS,
	PUBLIC_SITE_URL
} from '$env/static/public';

export interface SiteMetadata {
	title: string;
	description: string;
	keywords: string;
	url: string;
	image: string;
	imageWidth?: number;
	imageHeight?: number;
}

/**
 * Default metadata that applies site-wide.
 * Can be overridden dynamically for each page or component.
 */
export const defaultSiteMeta: SiteMetadata = {
	title: PUBLIC_SITE_TITLE,
	description: PUBLIC_SITE_DESCRIPTION,
	keywords: PUBLIC_SITE_KEYWORDS,
	url: PUBLIC_SITE_URL,
	image: ogImages.main,
	imageWidth: 1200,
	imageHeight: 630
};

/**
 * Utility function to generate flexible metadata objects.
 * Merges defaults with any overrides provided.
 */
export function createSiteMeta(overrides: Partial<SiteMetadata> = {}): SiteMetadata {
	return {
		...defaultSiteMeta,
		...overrides
	};
}
