import type { RequestHandler } from '@sveltejs/kit';
import { fetchPublications } from '$lib/services/atproto';
import { getPublicationFromSlug, isTidFormat, getSlugFromPublicationRkey } from '$lib/config/slugs';

/**
 * Dynamic slug/rkey root redirect handler
 *
 * Handles both:
 * - /{slug} redirects to the appropriate Standard.site publication URL
 * - /{publication-rkey} redirects to the publication (for site.standard.publication rkeys)
 * 
 * Uses the slug mapping config to find the publication rkey for slugs.
 * Individual documents are handled by the [rkey] route.
 */
export const GET: RequestHandler = async ({ params, url }) => {
	const slugOrRkey = params.slug;

	// If there's a path after /{slugOrRkey}, let it fall through to other routes
	const slugPath = url.pathname.replace(new RegExp(`^/${slugOrRkey}/?`), '');

	if (slugPath && !['rss', 'atom'].includes(slugPath)) {
		// This will be caught by the [rkey] route
		return new Response(null, {
			status: 404,
			headers: {
				'Content-Type': 'text/plain; charset=utf-8'
			}
		});
	}

	// For /{slugOrRkey} root, redirect to the publication
	if (!slugPath || slugPath === '') {
		// Validate input
		if (!slugOrRkey) {
			return new Response('Invalid slug or rkey', {
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
			// Input is an rkey - use it directly
			publicationRkey = slugOrRkey;
			isDirectRkey = true;
		} else {
			// Input is a slug - look up the rkey
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
		let redirectUrl: string | null = null;

		try {
			// Fetch Standard.site publications
			const { publications } = await fetchPublications();
			const publication = publications.find((p) => p.rkey === publicationRkey);

			if (publication) {
				// Use the publication URL directly
				redirectUrl = publication.url.startsWith('http')
					? publication.url
					: `https://${publication.url}`;
			}
		} catch (error) {
			console.error(`Error fetching publication:`, error);
		}

		// If we have a redirect URL, use it
		if (redirectUrl) {
			return new Response(null, {
				status: 301,
				headers: {
					Location: redirectUrl,
					'Cache-Control': 'public, max-age=3600'
				}
			});
		}

		// No publication found
		const identifier = isDirectRkey ? `rkey: ${slugOrRkey}` : `slug: ${slugOrRkey}`;
		return new Response(
			`Publication not found for ${identifier}\n\n${
				isDirectRkey
					? 'This publication rkey does not exist or is not accessible.'
					: 'Please check your configuration in src/lib/data/slug-mappings.ts'
			}`,
			{
				status: 404,
				headers: {
					'Content-Type': 'text/plain; charset=utf-8'
				}
			}
		);
	}

	return new Response(null, { status: 404 });
};
