import { env } from '$env/dynamic/private';
import { PUBLIC_ATPROTO_DID } from '$env/static/public';

/**
 * Bridges SvelteKit's private env into process.env for the @ewanc26/supporters package,
 * which reads credentials via process.env rather than SvelteKit's env system.
 *
 * Call this once at the top of any server route that writes to the PDS.
 */
export function bridgeAtprotoEnv(): void {
	process.env.ATPROTO_DID = PUBLIC_ATPROTO_DID;
	process.env.ATPROTO_APP_PASSWORD = env.ATPROTO_APP_PASSWORD;
}
