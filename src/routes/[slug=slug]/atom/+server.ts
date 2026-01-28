import type { RequestHandler } from '@sveltejs/kit';
import { getPublicationRkeyFromSlug, isTidFormat } from '$lib/config/slugs';

/**
 * Deprecated Atom feed
 *
 * Accessible via:
 * - /{slug}/atom - publication identified by slug
 * - /{publication-rkey}/atom - publication identified by rkey
 *
 * Atom feeds are no longer supported. Use RSS instead.
 *
 * Rationale:
 * - RSS is more widely supported in feed readers
 * - Leaflet provides native RSS feeds that include full content
 * - WhiteWind posts are included in our RSS feed
 * - Maintaining both RSS and Atom adds unnecessary complexity
 */
export const GET: RequestHandler = ({ params }) => {
	const slugOrRkey = params.slug;

	// Validate input
	if (!slugOrRkey) {
		return new Response('Invalid slug or publication rkey', {
			status: 400,
			headers: {
				'Content-Type': 'text/plain; charset=utf-8'
			}
		});
	}

	// Validate that either the slug exists in config or it's a valid rkey
	if (!isTidFormat(slugOrRkey)) {
		const publicationRkey = getPublicationRkeyFromSlug(slugOrRkey);

		if (!publicationRkey) {
			return new Response(
				`Slug not configured: ${slugOrRkey}\n\nPlease add this slug to src/lib/config/slugs.ts`,
				{
					status: 404,
					headers: {
						'Content-Type': 'text/plain; charset=utf-8'
					}
				}
			);
		}
	}

	return new Response(
		`Atom Feed Deprecated

This Atom feed is no longer available. Please use the RSS feed instead:

RSS Feed: /${slugOrRkey}/rss

For Leaflet posts with full content, the RSS feed will automatically redirect you to 
Leaflet's native RSS feed which includes complete post content.

For WhiteWind posts, the RSS feed includes links to posts on WhiteWind.`,
		{
			status: 410, // 410 Gone - resource permanently unavailable
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
				'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
			}
		}
	);
};
