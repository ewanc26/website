import type { RequestHandler } from '@sveltejs/kit';

/**
 * Blog root redirect handler
 * 
 * This redirects /blog to a helpful page explaining the blog setup.
 * Individual posts are handled by the [rkey] route which detects
 * whether the post is from WhiteWind or Leaflet.
 */
export const GET: RequestHandler = ({ url }) => {
	// If there's a path after /blog, let it fall through to other routes
	const blogPath = url.pathname.replace(/^\/blog\/?/, '');
	
	if (blogPath && !['rss', 'atom'].includes(blogPath)) {
		// This will be caught by the [rkey] route
		return new Response(null, {
			status: 404,
			headers: {
				'Content-Type': 'text/plain; charset=utf-8'
			}
		});
	}

	// For /blog root, return a helpful message
	if (!blogPath || blogPath === '') {
		return new Response(
			`Blog posts are distributed across multiple platforms:

- WhiteWind: https://whtwnd.com
- Leaflet: https://leaflet.pub

Individual post URLs like /blog/{rkey} will automatically redirect to the correct platform.

For RSS feeds, visit: /blog/rss`,
			{
				status: 200,
				headers: {
					'Content-Type': 'text/plain; charset=utf-8'
				}
			}
		);
	}

	return new Response(null, { status: 404 });
};
