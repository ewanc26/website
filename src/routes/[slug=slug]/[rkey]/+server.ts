import type { RequestHandler } from '@sveltejs/kit';
import { PUBLIC_ATPROTO_DID, PUBLIC_BLOG_FALLBACK_URL } from '$env/static/public';
import { withFallback } from '$lib/services/atproto';
import { fetchPublications } from '$lib/services/atproto';
import { getPublicationFromSlug } from '$lib/config/slugs';
import type { PublicationPlatform } from '$lib/data/slug-mappings';

/**
 * Smart document redirect handler for slugged publications
 *
 * Automatically detects Standard.site documents and redirects to the canonical URL.
 * Uses the publication's URL + document path to construct the final URL.
 *
 * If detection fails, falls back to PUBLIC_BLOG_FALLBACK_URL or returns 404.
 */

async function detectDocumentUrl(
	rkey: string,
	publicationRkey: string
): Promise<{ url?: string } | null> {
	try {
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
			const { publications } = await fetchPublications();
			let publication = null;

			// Check if site points to a publication URI
			if (documentSite?.startsWith('at://')) {
				publication = publications.find((p) => p.uri === documentSite);

				// Verify this document belongs to the requested publication
				if (publication && publication.rkey !== publicationRkey) {
					return null;
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
				const basePath = documentSite.endsWith('/') ? documentSite.slice(0, -1) : documentSite;
				const docPath = value.path || `/${rkey}`;
				url = `${basePath}${docPath.startsWith('/') ? docPath : '/' + docPath}`;
			}

			return { url };
		}

		return null;
	} catch (error) {
		console.error('Error detecting document URL:', error);
		return null;
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

	const { rkey: publicationRkey } = publicationInfo;

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

	// Detect document and get canonical URL
	const detection = await detectDocumentUrl(rkey, publicationRkey);

	let targetUrl: string | null = null;
	let statusCode = 301;

	if (detection?.url) {
		// Found the document
		targetUrl = detection.url;
	} else if (PUBLIC_BLOG_FALLBACK_URL) {
		// Use fallback URL from environment variable
		targetUrl = `${PUBLIC_BLOG_FALLBACK_URL}/${rkey}`;
	} else {
		// No fallback configured, return 404
		return new Response(
			`Document not found: ${rkey}

This document could not be found in the Standard.site publication for slug "${slug}".

Note: Only checking Standard.site publication with rkey: ${publicationRkey}

Please check: https://standard.site`,
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
