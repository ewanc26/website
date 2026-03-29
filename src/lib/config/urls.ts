/**
 * External service URLs used across the application.
 *
 * Centralised here so changes to a service's web client only need
 * to be made in one place.
 */

/** Bluesky web client base URL. */
export const WITCHSKY_BASE_URL = 'https://witchsky.app';

/** Build a witchsky profile URL from a DID or handle. */
export function witchskyProfileUrl(identifier: string): string {
	return `${WITCHSKY_BASE_URL}/profile/${identifier}`;
}

/** Build a witchsky post URL from an AT-URI (`at://did/.../rkey`). */
export function witchskyPostUrl(atUri: string): string {
	const parts = atUri.split('/');
	const did = parts[2];
	const rkey = parts[4];
	return `${WITCHSKY_BASE_URL}/profile/${did}/post/${rkey}`;
}

/** Build a witchsky hashtag URL. */
export function witchskyHashtagUrl(tag: string): string {
	return `${WITCHSKY_BASE_URL}/hashtag/${tag}`;
}
