import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PUBLIC_AP_INSTANCE_URL, PUBLIC_AP_USERNAME, PUBLIC_SITE_URL } from '$env/static/public';

export const prerender = false;

function knownResources() {
	const instanceDomain = new URL(PUBLIC_AP_INSTANCE_URL).hostname;
	const siteDomain = new URL(PUBLIC_SITE_URL).hostname;
	return new Set([
		`acct:${PUBLIC_AP_USERNAME}@${instanceDomain}`,
		`acct:${PUBLIC_AP_USERNAME}@${siteDomain}`,
		`${PUBLIC_AP_INSTANCE_URL}/@${PUBLIC_AP_USERNAME}`
	]);
}

export const GET: RequestHandler = async ({ url, setHeaders, fetch }) => {
	const resource = url.searchParams.get('resource');

	if (!resource) {
		throw error(400, 'Missing resource parameter');
	}

	if (!knownResources().has(resource)) {
		throw error(404, 'Resource not found');
	}

	// Proxy the canonical webfinger from the AP instance so we don't need to
	// hardcode internal user IDs — the instance always returns the correct links.
	const instanceUrl = `${PUBLIC_AP_INSTANCE_URL}/.well-known/webfinger?resource=acct:${PUBLIC_AP_USERNAME}@${new URL(PUBLIC_AP_INSTANCE_URL).hostname}`;
	const upstream = await fetch(instanceUrl);

	if (!upstream.ok) {
		throw error(502, 'Failed to fetch webfinger from AP instance');
	}

	const webfinger = await upstream.json();

	// Inject the site-domain alias so Fediverse servers can resolve @user@sitedomain
	const siteDomain = new URL(PUBLIC_SITE_URL).hostname;
	const siteAlias = `acct:${PUBLIC_AP_USERNAME}@${siteDomain}`;
	const aliases: string[] = webfinger.aliases ?? [];
	if (!aliases.includes(siteAlias)) {
		webfinger.aliases = [siteAlias, ...aliases];
	}

	setHeaders({ 'Content-Type': 'application/jrd+json' });
	return json(webfinger);
};
