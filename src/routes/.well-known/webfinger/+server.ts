import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PUBLIC_SITE_URL } from '$env/static/public';

export const prerender = false;

export const GET: RequestHandler = async ({ url, setHeaders, fetch }) => {
	const apInstanceUrl = process.env.PUBLIC_AP_INSTANCE_URL;
	const apUsername = process.env.PUBLIC_AP_USERNAME;

	if (!apInstanceUrl || !apUsername) {
		throw error(501, 'ActivityPub not configured');
	}

	const resource = url.searchParams.get('resource');

	if (!resource) {
		throw error(400, 'Missing resource parameter');
	}

	const instanceDomain = new URL(apInstanceUrl).hostname;
	const siteDomain = new URL(PUBLIC_SITE_URL).hostname;
	const knownResources = new Set([
		`acct:${apUsername}@${instanceDomain}`,
		`acct:${apUsername}@${siteDomain}`,
		`${apInstanceUrl}/@${apUsername}`
	]);

	if (!knownResources.has(resource)) {
		throw error(404, 'Resource not found');
	}

	// Proxy the canonical webfinger from the AP instance so we don't need to
	// hardcode internal user IDs — the instance always returns the correct links.
	const instanceUrl = `${apInstanceUrl}/.well-known/webfinger?resource=acct:${apUsername}@${instanceDomain}`;
	const upstream = await fetch(instanceUrl);

	if (!upstream.ok) {
		throw error(502, 'Failed to fetch webfinger from AP instance');
	}

	const webfinger = await upstream.json();

	// Inject the site-domain alias so Fediverse servers can resolve @user@sitedomain
	const siteAlias = `acct:${apUsername}@${siteDomain}`;
	const aliases: string[] = webfinger.aliases ?? [];
	if (!aliases.includes(siteAlias)) {
		webfinger.aliases = [siteAlias, ...aliases];
	}

	setHeaders({ 'Content-Type': 'application/jrd+json' });
	return json(webfinger);
};
