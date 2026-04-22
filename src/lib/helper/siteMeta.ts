import { ogUrl } from '$lib/helper/ogImages';
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
 * Generates dynamic OG images via /api/og endpoint.
 */
export const defaultSiteMeta: SiteMetadata = {
	title: PUBLIC_SITE_TITLE,
	description: PUBLIC_SITE_DESCRIPTION,
	keywords: PUBLIC_SITE_KEYWORDS,
	url: PUBLIC_SITE_URL,
	image: `${PUBLIC_SITE_URL}${ogUrl({ title: PUBLIC_SITE_TITLE })}`,
	imageWidth: 1200,
	imageHeight: 630
};

/**
 * Create site meta with dynamic OG image.
 *
 * @example
 * ```ts
 * // Home page
 * createDynamicSiteMeta({
 *   title: "Ewan's Corner",
 *   description: 'personal site, blog, and digital garden'
 * })
 *
 * // Blog post
 * createDynamicSiteMeta({
 *   title: post.title,
 *   description: post.description,
 *   template: 'blog'
 * })
 * ```
 */
export interface DynamicSiteMetaOptions {
	title: string;
	description?: string;
	template?: 'default' | 'blog' | 'profile';
	url?: string;
}

export function createDynamicSiteMeta(options: DynamicSiteMetaOptions): SiteMetadata {
	const siteUrl = options.url || PUBLIC_SITE_URL;
	const title =
		options.title === PUBLIC_SITE_TITLE
			? PUBLIC_SITE_TITLE
			: `${options.title} | ${PUBLIC_SITE_TITLE}`;

	return {
		title,
		description: options.description || PUBLIC_SITE_DESCRIPTION,
		keywords: PUBLIC_SITE_KEYWORDS,
		url: siteUrl,
		image: `${PUBLIC_SITE_URL}${ogUrl({
			title: options.title,
			description: options.description,
			template: options.template
		})}`,
		imageWidth: 1200,
		imageHeight: 630
	};
}
