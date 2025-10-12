import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = () => {
    return new Response('The Atom feed for status updates at /now/atom has been retired and is no longer available.', {
        status: 410,
        headers: {
            'Content-Type': 'text/plain'
        }
    });
};