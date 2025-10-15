import type { SiteMetadata } from './siteMeta';

/**
 * Generates an array of meta tag objects for Svelte head.
 * Falls back to site defaults if a property is missing.
 */
export function generateMetaTags(meta: SiteMetadata, defaults: SiteMetadata) {
	const finalMeta: SiteMetadata = {
		title: meta.title || defaults.title,
		description: meta.description || defaults.description,
		keywords: meta.keywords || defaults.keywords,
		url: meta.url || defaults.url,
		image: meta.image || defaults.image,
		imageWidth: meta.imageWidth || defaults.imageWidth,
		imageHeight: meta.imageHeight || defaults.imageHeight
	};

	return [
		{ name: 'description', content: finalMeta.description },
		{ name: 'keywords', content: finalMeta.keywords },

		{ property: 'og:type', content: 'website' },
		{ property: 'og:url', content: finalMeta.url },
		{ property: 'og:title', content: finalMeta.title },
		{ property: 'og:description', content: finalMeta.description },
		{ property: 'og:site_name', content: defaults.title }, // always site title for OG
		{ property: 'og:image', content: finalMeta.image },
		...(finalMeta.imageWidth ? [{ property: 'og:image:width', content: finalMeta.imageWidth.toString() }] : []),
		...(finalMeta.imageHeight ? [{ property: 'og:image:height', content: finalMeta.imageHeight.toString() }] : []),

		{ name: 'twitter:card', content: 'summary_large_image' },
		{ name: 'twitter:url', content: finalMeta.url },
		{ name: 'twitter:title', content: finalMeta.title },
		{ name: 'twitter:description', content: finalMeta.description },
		{ name: 'twitter:image', content: finalMeta.image }
	];
}