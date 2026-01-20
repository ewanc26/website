import type { Handle } from '@sveltejs/kit';
import { PUBLIC_CORS_ALLOWED_ORIGINS } from '$env/static/public';
import { HTTP_CACHE_HEADERS } from '$lib/config/cache.config';

/**
 * Global request handler with CORS support
 *
 * CORS headers are dynamically configured via the PUBLIC_CORS_ALLOWED_ORIGINS environment variable.
 * Set it to a comma-separated list of allowed origins, or "*" to allow all origins.
 */
export const handle: Handle = async ({ event, resolve }) => {
	// Handle OPTIONS preflight requests for CORS
	if (event.request.method === 'OPTIONS' && event.url.pathname.startsWith('/api/')) {
		const origin = event.request.headers.get('origin');
		const allowedOrigins = PUBLIC_CORS_ALLOWED_ORIGINS?.split(',').map((o: string) => o.trim()) || [];

		const headers: Record<string, string> = {
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
			'Access-Control-Max-Age': '86400'
		};

		if (allowedOrigins.includes('*')) {
			headers['Access-Control-Allow-Origin'] = '*';
		} else if (origin && allowedOrigins.includes(origin)) {
			headers['Access-Control-Allow-Origin'] = origin;
			headers['Vary'] = 'Origin';
		}

		return new Response(null, { status: 204, headers });
	}

	const response = await resolve(event, {
		filterSerializedResponseHeaders: (name) => {
			return name === 'content-type' || name === 'cache-control' || name.startsWith('x-');
		}
	});

	// Add HTTP caching headers for better performance and reduced timeouts
	// Layout data (root route) is cached aggressively since profile/site info changes infrequently
	if (!event.url.pathname.startsWith('/api/')) {
		// Root layout loads profile and site info - cache aggressively
		if (event.url.pathname === '/' || event.url.pathname === '') {
			response.headers.set('Cache-Control', HTTP_CACHE_HEADERS.LAYOUT);
		}
		// Blog listing pages
		else if (event.url.pathname.startsWith('/blog') || event.url.pathname.startsWith('/archive')) {
			response.headers.set('Cache-Control', HTTP_CACHE_HEADERS.BLOG_LISTING);
		}
		// Individual blog post pages
		else if (event.url.pathname.match(/^\/[a-z0-9-]+$/)) {
			response.headers.set('Cache-Control', HTTP_CACHE_HEADERS.BLOG_POST);
		}
		// Other pages get moderate caching
		else {
			response.headers.set('Cache-Control', HTTP_CACHE_HEADERS.LAYOUT);
		}
	}

	// Add CORS headers for API routes
	if (event.url.pathname.startsWith('/api/')) {
		const origin = event.request.headers.get('origin');
		const allowedOrigins = PUBLIC_CORS_ALLOWED_ORIGINS?.split(',').map((o: string) => o.trim()) || [];

		// If * is specified, allow any origin
		if (allowedOrigins.includes('*')) {
			response.headers.set('Access-Control-Allow-Origin', '*');
		} else if (origin && allowedOrigins.includes(origin)) {
			// Only set the specific origin if it's in the allowed list
			response.headers.set('Access-Control-Allow-Origin', origin);
			response.headers.set('Vary', 'Origin');
		}

		response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
		response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
		response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
	}

	return response;
};
