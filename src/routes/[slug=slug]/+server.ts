import type { RequestHandler } from '@sveltejs/kit';
import { fetchPublications } from '$lib/services/atproto';
import { getPublicationFromSlug } from '$lib/config/slugs';

/**
 * Dynamic slug root redirect handler
 *
 * Redirects /{slug} to the appropriate Standard.site publication URL
 * Uses the slug mapping config to find the publication rkey
 * Individual documents are handled by the [rkey] route.
 */
export const GET: RequestHandler = async ({ params, url }) => {
	const slug = params.slug;

	// If there's a path after /{slug}, let it fall through to other routes
	const slugPath = url.pathname.replace(new RegExp(`^/${slug}/?`), '');

	if (slugPath && !['rss', 'atom'].includes(slugPath)) {
		// This will be caught by the [rkey] route
		return new Response(null, {
			status: 404,
			headers: {
				'Content-Type': 'text/plain; charset=utf-8'
			}
		});
	}

	// For /{slug} root, redirect to the publication
	if (!slugPath || slugPath === '') {
		// Validate slug and get the publication info
		if (!slug) {
			return new Response('Invalid slug', {
				status: 400,
				headers: {
					'Content-Type': 'text/plain; charset=utf-8'
				}
			});
		}

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
		return new Response(
			`Publication not found for slug: ${slug}\n\nPlease check your configuration in src/lib/data/slug-mappings.ts`,
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
