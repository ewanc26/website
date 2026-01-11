import type { RequestHandler } from '@sveltejs/kit';
import { PUBLIC_ATPROTO_DID } from '$env/static/public';
import { fetchLeafletPublications, fetchStandardSitePublications } from '$lib/services/atproto';
import { getPublicationFromSlug } from '$lib/config/slugs';

/**
 * Dynamic slug root redirect handler
 *
 * Redirects /{slug} to the appropriate publication (Leaflet or Standard.site):
 * - Uses the slug mapping config to find the publication rkey and platform
 * - For Leaflet: Priority 1: Publication base_path, Priority 2: /lish format
 * - For Standard.site: Uses the publication URL directly
 *
 * Individual posts are handled by the [rkey] route.
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

		const { rkey: publicationRkey, platform } = publicationInfo;
		let redirectUrl: string | null = null;

		try {
			if (platform === 'standard.site') {
				// Fetch Standard.site publications
				const { publications } = await fetchStandardSitePublications();
				const publication = publications.find((p) => p.rkey === publicationRkey);

				if (publication) {
					// Use the publication URL directly
					redirectUrl = publication.url.startsWith('http')
						? publication.url
						: `https://${publication.url}`;
				}
			} else {
				// Fetch Leaflet publications
				const { publications } = await fetchLeafletPublications();
				const publication = publications.find((p) => p.rkey === publicationRkey);

				if (publication?.basePath) {
					// Ensure basePath is a complete URL
					redirectUrl = publication.basePath.startsWith('http')
						? publication.basePath
						: `https://${publication.basePath}`;
				} else {
					// Use Leaflet /lish format
					redirectUrl = `https://leaflet.pub/lish/${PUBLIC_ATPROTO_DID}/${publicationRkey}`;
				}
			}
		} catch (error) {
			console.error(`Error fetching ${platform} publication:`, error);
			// Fallback based on platform
			if (platform === 'leaflet') {
				redirectUrl = `https://leaflet.pub/lish/${PUBLIC_ATPROTO_DID}/${publicationRkey}`;
			}
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
