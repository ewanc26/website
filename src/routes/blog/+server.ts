import type { RequestHandler } from '@sveltejs/kit';
import {
	PUBLIC_ATPROTO_DID,
	PUBLIC_LEAFLET_BASE_PATH,
	PUBLIC_LEAFLET_BLOG_PUBLICATION,
	PUBLIC_ENABLE_WHITEWIND
} from '$env/static/public';
import { fetchLeafletPublications } from '$lib/services/atproto';

/**
 * Blog root redirect handler
 * 
 * Redirects /blog to the appropriate blog platform:
 * - Priority 1: Leaflet blog (if PUBLIC_LEAFLET_BASE_PATH is configured)
 * - Priority 2: Leaflet publication page (if PUBLIC_LEAFLET_BLOG_PUBLICATION is set)
 * - Fallback: WhiteWind blog page (if PUBLIC_ENABLE_WHITEWIND is true)
 * 
 * Individual posts are handled by the [rkey] route which detects
 * whether the post is from Leaflet or WhiteWind (if enabled).
 */
export const GET: RequestHandler = async ({ url }) => {
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

		// For /blog root, redirect to the blog platform
	if (!blogPath || blogPath === '') {
		let redirectUrl: string | null = null;

		// Priority 1: Use Leaflet base path if configured
		if (PUBLIC_LEAFLET_BASE_PATH) {
			redirectUrl = PUBLIC_LEAFLET_BASE_PATH;
		} 
		// Priority 2: Use Leaflet publication page if configured
		else if (PUBLIC_LEAFLET_BLOG_PUBLICATION) {
			try {
				const { publications } = await fetchLeafletPublications();
				const publication = publications.find(p => p.rkey === PUBLIC_LEAFLET_BLOG_PUBLICATION);
				
				if (publication?.basePath) {
					// Ensure basePath is a complete URL
					redirectUrl = publication.basePath.startsWith('http') 
						? publication.basePath 
						: `https://${publication.basePath}`;
				} else {
					// Use Leaflet /lish format
					redirectUrl = `https://leaflet.pub/lish/${PUBLIC_ATPROTO_DID}/${PUBLIC_LEAFLET_BLOG_PUBLICATION}`;
				}
			} catch (error) {
				console.error('Error fetching Leaflet publication:', error);
				// Will check WhiteWind fallback below
			}
		}
		
		// Fallback: WhiteWind blog page (if enabled)
		if (!redirectUrl && PUBLIC_ENABLE_WHITEWIND === 'true') {
			redirectUrl = `https://whtwnd.com/${PUBLIC_ATPROTO_DID}`;
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

		// No blog configured
		return new Response(
			'Blog not configured. Please set PUBLIC_LEAFLET_BASE_PATH or PUBLIC_LEAFLET_BLOG_PUBLICATION in your environment variables.',
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
