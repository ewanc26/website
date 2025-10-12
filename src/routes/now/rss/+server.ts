import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = () => {
    return new Response('The RSS feed for status updates at /now/rss has been retired and is no longer available.', {
        status: 410,
        headers: {
            'Content-Type': 'text/plain'
        }
    });
};
