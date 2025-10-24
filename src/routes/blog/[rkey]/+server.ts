import type { RequestHandler } from '@sveltejs/kit';
import {
	PUBLIC_ATPROTO_DID,
	PUBLIC_LEAFLET_BASE_PATH,
	PUBLIC_LEAFLET_BLOG_PUBLICATION,
	PUBLIC_BLOG_FALLBACK_URL
} from '$env/static/public';
import { withFallback } from '$lib/services/atproto';
import { fetchLeafletPublications } from '$lib/services/atproto';

/**
 * Smart blog post redirect handler
 *
 * Automatically detects whether the post is from WhiteWind or Leaflet
 * and redirects to the appropriate URL.
 *
 * WhiteWind: https://whtwnd.com/{DID}/{rkey}
 * Leaflet: {LEAFLET_BASE_PATH}/{rkey} or https://leaflet.pub/{DID}/{rkey}
 *
 * If detection fails, falls back to PUBLIC_BLOG_FALLBACK_URL or returns 404.
 *
 * Supports multiple Leaflet publications:
 * - If PUBLIC_LEAFLET_BLOG_PUBLICATION is set, only checks that specific publication
 * - Otherwise, checks all publications for the document
 */

async function detectPostPlatform(
	rkey: string
): Promise<{ platform: 'whitewind' | 'leaflet' | 'unknown'; url?: string }> {
	try {
		// Check WhiteWind first using atproto services
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

		// Check Leaflet using atproto services
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
			const publicationUri = value?.publication;

			// Fetch publications to get base path
			const { publications } = await fetchLeafletPublications();
			const publication = publicationUri
				? publications.find((p) => p.uri === publicationUri)
				: null;

			// If a specific blog publication is configured, check if this document belongs to it
			if (PUBLIC_LEAFLET_BLOG_PUBLICATION && publication) {
				if (publication.rkey !== PUBLIC_LEAFLET_BLOG_PUBLICATION) {
					// Document belongs to a different publication, not the blog
					return { platform: 'unknown' };
				}
			}

			// Determine URL based on priority: env var → publication base_path → Leaflet /lish format
			let url: string;
			const publicationRkey = publication?.rkey || '';

			if (PUBLIC_LEAFLET_BASE_PATH) {
				url = `${PUBLIC_LEAFLET_BASE_PATH}/${rkey}`;
			} else if (publication?.basePath) {
				// Ensure basePath is a complete URL
				const basePath = publication.basePath.startsWith('http') 
					? publication.basePath 
					: `https://${publication.basePath}`;
				url = `${basePath}/${rkey}`;
			} else if (publicationRkey) {
				url = `https://leaflet.pub/lish/${PUBLIC_ATPROTO_DID}/${publicationRkey}/${rkey}`;
			} else {
				url = `https://leaflet.pub/${PUBLIC_ATPROTO_DID}/${rkey}`;
			}

			return {
				platform: 'leaflet',
				url
			};
		}

		return { platform: 'unknown' };
	} catch (error) {
		console.error('Error detecting post platform:', error);
		return { platform: 'unknown' };
	}
}

export const GET: RequestHandler = async ({ params, url }) => {
	const rkey = params.rkey;

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
	const detection = await detectPostPlatform(rkey);

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
		const blogPublicationNote = PUBLIC_LEAFLET_BLOG_PUBLICATION
			? `\n\nNote: Only checking Leaflet publication: ${PUBLIC_LEAFLET_BLOG_PUBLICATION}`
			: '';

		return new Response(
			`Blog post not found: ${rkey}

This post could not be found on WhiteWind or Leaflet platforms.${blogPublicationNote}

Please check:
- WhiteWind: https://whtwnd.com
- Leaflet: https://leaflet.pub`,
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