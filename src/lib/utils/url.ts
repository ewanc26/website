/**
 * URL and domain utilities
 */

/**
 * Extracts the domain name from a URL
 * @param url - The URL to extract from
 * @returns The domain name without www prefix
 */
export function getDomain(url: string): string {
	try {
		const urlObj = new URL(url);
		return urlObj.hostname.replace('www.', '');
	} catch {
		return '';
	}
}

/**
 * Converts an AT Protocol URI to a Bluesky web URL
 * @param uri - AT URI format (at://did:plc:xxx/app.bsky.feed.post/rkey)
 * @returns Bluesky web URL
 */
export function atUriToBlueskyUrl(uri: string): string {
	const parts = uri.split('/');
	const did = parts[2];
	const rkey = parts[4];
	return `https://bsky.app/profile/${did}/post/${rkey}`;
}

/**
 * Gets a Bluesky profile URL from a handle or DID
 * @param actor - Handle (e.g., "user.bsky.social") or DID
 * @returns Bluesky profile URL
 */
export function getBlueskyProfileUrl(actor: string): string {
	return `https://bsky.app/profile/${actor}`;
}

/**
 * Checks if a URL is external (not same origin)
 * @param url - The URL to check
 * @returns True if external, false otherwise
 */
export function isExternalUrl(url: string): boolean {
	if (typeof window === 'undefined') return true;
	
	try {
		const urlObj = new URL(url, window.location.href);
		return urlObj.origin !== window.location.origin;
	} catch {
		return false;
	}
}
