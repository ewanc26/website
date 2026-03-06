export function getDomain(url: string): string {
	try {
		const urlObj = new URL(url);
		return urlObj.hostname.replace('www.', '');
	} catch {
		return '';
	}
}

export function atUriToBlueskyUrl(uri: string): string {
	const parts = uri.split('/');
	const did = parts[2];
	const rkey = parts[4];
	return `https://witchsky.app/profile/${did}/post/${rkey}`;
}

export function getBlueskyProfileUrl(actor: string): string {
	return `https://witchsky.app/profile/${actor}`;
}

export function isExternalUrl(url: string): boolean {
	if (typeof window === 'undefined') return true;
	try {
		const urlObj = new URL(url, window.location.href);
		return urlObj.origin !== window.location.origin;
	} catch {
		return false;
	}
}
