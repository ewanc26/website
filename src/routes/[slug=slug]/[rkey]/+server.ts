import type { RequestHandler } from '@sveltejs/kit';
import { PUBLIC_ATPROTO_DID, PUBLIC_BLOG_FALLBACK_URL } from '$env/static/public';
import { withFallback } from '$lib/services/atproto';
import { fetchPublications } from '$lib/services/atproto';
import { getPublicationFromSlug, isTidFormat } from '$lib/config/slugs';
import type { PublicationPlatform } from '$lib/data/slug-mappings';

/**
 * Smart document redirect handler for slugged or rkey-based publications
 *
 * Handles both:
 * - /{slug}/{document-rkey} - publication identified by slug
 * - /{publication-rkey}/{document-rkey} - publication identified by rkey
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
	const slugOrRkey = params.slug;
	const documentRkey = params.rkey;

	// Validate input
	if (!slugOrRkey) {
		return new Response('Invalid slug or publication rkey', {
			status: 400,
			headers: {
				'Content-Type': 'text/plain; charset=utf-8'
			}
		});
	}

	let publicationRkey: string;
	let isDirectRkey = false;

	// Check if input is a TID (rkey) or a slug
	if (isTidFormat(slugOrRkey)) {
		// Input is a publication rkey - use it directly
		publicationRkey = slugOrRkey;
		isDirectRkey = true;
	} else {
		// Input is a slug - look up the publication rkey
		const publicationInfo = getPublicationFromSlug(slugOrRkey);

		if (!publicationInfo) {
			return new Response(
				`Slug not configured: ${slugOrRkey}\n\nPlease add this slug to src/lib/data/slug-mappings.ts`,
				{
					status: 404,
					headers: {
						'Content-Type': 'text/plain; charset=utf-8'
					}
				}
			);
		}

		publicationRkey = publicationInfo.rkey;
	}

	// Validate document rkey TID format (AT Protocol record key)
	const tidPattern = /^[a-zA-Z0-9]{12,16}$/;

	if (!documentRkey || !tidPattern.test(documentRkey)) {
		return new Response('Invalid document TID format. Expected 12-16 alphanumeric characters.', {
			status: 400,
			headers: {
				'Content-Type': 'text/plain; charset=utf-8'
			}
		});
	}

	// Detect document and get canonical URL
	const detection = await detectDocumentUrl(documentRkey, publicationRkey);

	let targetUrl: string | null = null;
	let statusCode = 301;

	if (detection?.url) {
		// Found the document
		targetUrl = detection.url;
	} else if (PUBLIC_BLOG_FALLBACK_URL) {
		// Use fallback URL from environment variable
		targetUrl = `${PUBLIC_BLOG_FALLBACK_URL}/${documentRkey}`;
	} else {
		// No fallback configured, return 404
		const identifier = isDirectRkey ? `publication rkey "${slugOrRkey}"` : `slug "${slugOrRkey}"`;
		return new Response(
			`Document not found: ${documentRkey}

This document could not be found in the Standard.site publication for ${identifier}.

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
