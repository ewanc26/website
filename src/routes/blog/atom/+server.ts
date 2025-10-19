import type { RequestHandler } from '@sveltejs/kit';

/**
 * Deprecated Atom feed
 *
 * Atom feeds are no longer supported. Use RSS instead.
 *
 * Rationale:
 * - RSS is more widely supported in feed readers
 * - Leaflet provides native RSS feeds that include full content
 * - WhiteWind posts are included in our RSS feed
 * - Maintaining both RSS and Atom adds unnecessary complexity
 */
export const GET: RequestHandler = () => {
	return new Response(
		`Atom Feed Deprecated

This Atom feed is no longer available. Please use the RSS feed instead:

RSS Feed: ${new URL('/blog/rss', 'http://localhost').pathname}

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
