import { ogImages } from '$lib/helper/ogImages';
import {
	PUBLIC_SITE_TITLE,
	PUBLIC_SITE_DESCRIPTION,
	PUBLIC_SITE_KEYWORDS,
	PUBLIC_SITE_URL
} from '$env/static/public';
import type { SiteMetadata } from '@ewanc26/ui';

export type { SiteMetadata };
export { createSiteMeta } from '@ewanc26/ui';

/**
 * Default metadata that applies site-wide.
 * Can be overridden per-page via createSiteMeta.
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
