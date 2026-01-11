import type { RequestHandler } from '@sveltejs/kit';
import {
	PUBLIC_ATPROTO_DID,
	PUBLIC_BLOG_FALLBACK_URL,
	PUBLIC_ENABLE_WHITEWIND
} from '$env/static/public';
import { withFallback } from '$lib/services/atproto';
import { fetchLeafletPublications, fetchStandardSitePublications } from '$lib/services/atproto';
import { getPublicationFromSlug } from '$lib/config/slugs';
import type { PublicationPlatform } from '$lib/data/slug-mappings';

/**
 * Smart document redirect handler for slugged publications
 *
 * Automatically detects whether the post is from Standard.site, Leaflet, or WhiteWind
 * and redirects to the appropriate URL.
 *
 * Priority order:
 * 1. Standard.site: Uses publication's URL + document path
 * 2. Leaflet: Uses publication's base_path or https://leaflet.pub/{DID}/{publicationRkey}/{rkey}
 * 3. WhiteWind: https://whtwnd.com/{DID}/{rkey} (only if PUBLIC_ENABLE_WHITEWIND is true)
 *
 * If detection fails, falls back to PUBLIC_BLOG_FALLBACK_URL or returns 404.
 *
 * Uses slug mapping to determine which publication and platform to check.
 */

async function detectPostPlatform(
	rkey: string,
	publicationRkey: string,
	platform: PublicationPlatform
): Promise<{ platform: 'whitewind' | 'leaflet' | 'standard.site' | 'unknown'; url?: string }> {
	try {
		// Check based on the platform specified in slug mapping
		if (platform === 'standard.site') {
			// Check Standard.site documents
			const standardRecord = await withFallback(
				PUBLIC_ATPROTO_DID,
				async (agent) => {
					try {
						const response = await agent.com.atproto.repo.getRecord({
							repo: PUBLIC_ATPROTO_DID,
							collection: 'site.standard.document',
							rkey
						});
						return response.data;
					} catch (err) {
						return null;
					}
				},
				true
			);

			if (standardRecord) {
				const value = standardRecord.value as any;
				const documentSite = value?.site;

				// Fetch publications to get the publication info
				const { publications } = await fetchStandardSitePublications();
				let publication = null;
				
				// Check if site points to a publication URI
				if (documentSite?.startsWith('at://')) {
					publication = publications.find((p) => p.uri === documentSite);
					
					// Verify this document belongs to the requested publication
					if (publication && publication.rkey !== publicationRkey) {
						return { platform: 'unknown' };
					}
				}

				// Build the URL
				let url: string;
				if (publication) {
					const basePath = publication.url.endsWith('/')
						? publication.url.slice(0, -1)
						: publication.url;
					const docPath = value.path || `/${rkey}`;
					url = `${basePath}${docPath.startsWith('/') ? docPath : '/' + docPath}`;
				} else {
					// Use the site value directly (it's a URL)
					const basePath = documentSite.endsWith('/')
						? documentSite.slice(0, -1)
						: documentSite;
					const docPath = value.path || `/${rkey}`;
					url = `${basePath}${docPath.startsWith('/') ? docPath : '/' + docPath}`;
				}

				return {
					platform: 'standard.site',
					url
				};
			}
		}

		// Check Leaflet (prioritized for leaflet platform or as fallback)
		const leafletRecord = await withFallback(
			PUBLIC_ATPROTO_DID,
			async (agent) => {
				try {
					const response = await agent.com.atproto.repo.getRecord({
						repo: PUBLIC_ATPROTO_DID,
						collection: 'pub.leaflet.document',
						rkey
					});
					return response.data;
				} catch (err) {
					// Record not found
					return null;
				}
			},
			true // Use PDS first for custom collections
		);

		if (leafletRecord) {
			const value = leafletRecord.value as any;
			const documentPublicationUri = value?.publication;

			// Fetch publications to get base path
			const { publications } = await fetchLeafletPublications();
			const publication = documentPublicationUri
				? publications.find((p) => p.uri === documentPublicationUri)
				: null;

			// Check if this document belongs to the requested publication (from slug)
			if (publication && publication.rkey !== publicationRkey) {
				// Document belongs to a different publication
				return { platform: 'unknown' };
			}

			// Determine URL based on publication base_path or Leaflet /lish format
			let url: string;
			const docPublicationRkey = publication?.rkey || publicationRkey;

			if (publication?.basePath) {
				// Ensure basePath is a complete URL
				const basePath = publication.basePath.startsWith('http')
					? publication.basePath
					: `https://${publication.basePath}`;
				url = `${basePath}/${rkey}`;
			} else if (docPublicationRkey) {
				url = `https://leaflet.pub/lish/${PUBLIC_ATPROTO_DID}/${docPublicationRkey}/${rkey}`;
			} else {
				url = `https://leaflet.pub/${PUBLIC_ATPROTO_DID}/${rkey}`;
			}

			return {
				platform: 'leaflet',
				url
			};
		}

		// Check WhiteWind as fallback (only if enabled)
		if (PUBLIC_ENABLE_WHITEWIND === 'true') {
			const whiteWindRecord = await withFallback(
				PUBLIC_ATPROTO_DID,
				async (agent) => {
					try {
						const response = await agent.com.atproto.repo.getRecord({
							repo: PUBLIC_ATPROTO_DID,
							collection: 'com.whtwnd.blog.entry',
							rkey
						});
						return response.data;
					} catch (err) {
						// Record not found
						return null;
					}
				},
				true // Use PDS first for custom collections
			);

			if (whiteWindRecord) {
				const value = whiteWindRecord.value as any;
				// Skip drafts and non-public posts
				if (!value?.isDraft && (!value?.visibility || value.visibility === 'public')) {
					return {
						platform: 'whitewind',
						url: `https://whtwnd.com/${PUBLIC_ATPROTO_DID}/${rkey}`
					};
				}
			}
		}

		return { platform: 'unknown' };
	} catch (error) {
		console.error('Error detecting post platform:', error);
		return { platform: 'unknown' };
	}
}

export const GET: RequestHandler = async ({ params, url }) => {
	const slug = params.slug;
	const rkey = params.rkey;

	// Validate slug
	if (!slug) {
		return new Response('Invalid slug', {
			status: 400,
			headers: {
				'Content-Type': 'text/plain; charset=utf-8'
			}
		});
	}

	// Get the publication info from the slug
	const publicationInfo = getPublicationFromSlug(slug);

	if (!publicationInfo) {
		return new Response(
			`Slug not configured: ${slug}\n\nPlease add this slug to src/lib/data/slug-mappings.ts`,
			{
				status: 404,
				headers: {
					'Content-Type': 'text/plain; charset=utf-8'
				}
			}
		);
	}

	const { rkey: publicationRkey, platform } = publicationInfo;

	// Validate TID format (AT Protocol record key)
	const tidPattern = /^[a-zA-Z0-9]{12,16}$/;

	if (!rkey || !tidPattern.test(rkey)) {
		return new Response('Invalid TID format. Expected 12-16 alphanumeric characters.', {
			status: 400,
			headers: {
				'Content-Type': 'text/plain; charset=utf-8'
			}
		});
	}

	// Detect platform and get appropriate URL
	const detection = await detectPostPlatform(rkey, publicationRkey, platform);

	let targetUrl: string | null = null;
	let statusCode = 301;

	if (detection.platform !== 'unknown' && detection.url) {
		// Found the post on WhiteWind or Leaflet
		targetUrl = detection.url;
	} else if (PUBLIC_BLOG_FALLBACK_URL) {
		// Use fallback URL from environment variable
		targetUrl = `${PUBLIC_BLOG_FALLBACK_URL}/${rkey}`;
	} else {
		// No fallback configured, return 404
		const platformName = platform === 'standard.site' ? 'Standard.site' : 'Leaflet';
		const publicationNote = `\n\nNote: Only checking ${platformName} publication with rkey: ${publicationRkey}`;
		const whiteWindNote =
			PUBLIC_ENABLE_WHITEWIND === 'true' ? '\n- WhiteWind: https://whtwnd.com' : '';
		const standardSiteNote = platform === 'standard.site' ? '\n- Standard.site: https://standard.site' : '';

		return new Response(
			`Document not found: ${rkey}

This document could not be found in the ${platformName} publication for slug "${slug}"${PUBLIC_ENABLE_WHITEWIND === 'true' ? ' or WhiteWind' : ''}.${publicationNote}

Please check:
- Leaflet: https://leaflet.pub${standardSiteNote}${whiteWindNote}`,
			{
				status: 404,
				headers: {
					'Content-Type': 'text/plain; charset=utf-8'
				}
			}
		);
	}

	// Preserve query string
	const queryString = url.search;
	targetUrl += queryString;

	// Use 301 for permanent redirect (better for SEO)
	return new Response(null, {
		status: statusCode,
		headers: {
			Location: targetUrl,
			'Cache-Control': 'public, max-age=31536000, immutable'
		}
	});
};
