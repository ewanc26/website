import { PUBLIC_ATPROTO_DID } from '$env/static/public';
import { fetchEvents, fetchSponsorEvents } from '@ewanc26/supporters';
import type { KofiSupportEvent, KofiEventType, GitHubSponsorEvent, GitHubSponsorshipAction } from '@ewanc26/supporters';

export type { KofiEventType, GitHubSponsorshipAction };

export type UnifiedSupportEvent =
	| ({ source: 'kofi' } & KofiSupportEvent)
	| ({ source: 'github' } & GitHubSponsorEvent);

export async function fetchAllSupporters(): Promise<UnifiedSupportEvent[]> {
	const [kofi, github] = await Promise.allSettled([
		fetchEvents(PUBLIC_ATPROTO_DID),
		fetchSponsorEvents(PUBLIC_ATPROTO_DID)
	]);

	const events: UnifiedSupportEvent[] = [];

	if (kofi.status === 'fulfilled') {
		for (const e of kofi.value) events.push({ source: 'kofi', ...e });
	}
	if (github.status === 'fulfilled') {
		for (const e of github.value) events.push({ source: 'github', ...e });
	}

	return events.sort((a, b) => b.date.getTime() - a.date.getTime());
}
