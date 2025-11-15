import type { Handle } from '@sveltejs/kit';
import { PUBLIC_CORS_ALLOWED_ORIGINS } from '$env/static/public';

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
		const allowedOrigins = PUBLIC_CORS_ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [];

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
			return name === 'content-type' || name.startsWith('x-');
		}
	});

	// Add CORS headers for API routes
	if (event.url.pathname.startsWith('/api/')) {
		const origin = event.request.headers.get('origin');
		const allowedOrigins = PUBLIC_CORS_ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [];

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