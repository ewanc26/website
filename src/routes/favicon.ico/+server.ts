import type { RequestHandler } from '@sveltejs/kit';

/**
 * Redirects /favicon.ico to /favicon/favicon.ico
 * 
 * This handles browsers that request favicon.ico from the root
 * and redirects them to the actual location in the /favicon/ directory.
 */
export const GET: RequestHandler = () => {
	return new Response(null, {
		status: 301, // Permanent redirect
		headers: {
			Location: '/favicon/favicon.ico',
			'Cache-Control': 'public, max-age=31536000, immutable'
		}
	});
};