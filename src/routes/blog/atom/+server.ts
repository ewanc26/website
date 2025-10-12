import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = () => {
    return new Response('this Atom feed is deprecated. Please use the RSS feed at https://blog.ewancroft.uk/rss.', {
        status: 301,
        headers: {
            Location: 'https://blog.ewancroft.uk/rss',
            'Content-Type': 'text/plain'
        }
    });
};