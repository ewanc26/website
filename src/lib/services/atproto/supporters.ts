import { PUBLIC_ATPROTO_DID } from '$env/static/public';
import { fetchEvents } from '@ewanc26/supporters';

export type { KofiSupportEvent } from '@ewanc26/supporters';
export type { KofiEventType } from '@ewanc26/supporters';

export function fetchSupporters() {
	return fetchEvents(PUBLIC_ATPROTO_DID);
}
