import type { RequestHandler } from './$types';

export const prerender = false;

export const GET: RequestHandler = ({ setHeaders }) => {
	setHeaders({ 'Content-Type': 'text/plain' });
	return new Response(process.env.PUBLIC_ATPROTO_DID ?? '');
};
