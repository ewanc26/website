import type { RequestHandler } from './$types';
import { PUBLIC_ATPROTO_DID } from '$env/dynamic/public';

export const prerender = false;

export const GET: RequestHandler = ({ setHeaders }) => {
	setHeaders({ 'Content-Type': 'text/plain' });
	return new Response(PUBLIC_ATPROTO_DID);
};
