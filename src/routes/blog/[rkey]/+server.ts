import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = ({ params, url }) => {
    const tid = params.rkey;
    const tidPattern = /^[a-zA-Z0-9]{12,16}$/;

    if (!tid || !tidPattern.test(tid)) {
        return new Response('Invalid TID', { status: 400 });
    }

    const queryString = url.search;
    const targetUrl = `https://blog.ewancroft.uk/${tid}${queryString}`;

    return new Response(null, {
        status: 301,
        headers: { Location: targetUrl }
    });
};
