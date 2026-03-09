/**
 * Ko-fi supporters service
 *
 * Reads uk.ewancroft.kofi.supporter records from the PDS as a timeline.
 * Each record is returned with its rkey and decoded timestamp.
 * No auth required — records are publicly readable.
 *
 * The PDS URL is resolved automatically from PUBLIC_ATPROTO_DID via resolveIdentity.
 */

import { PUBLIC_ATPROTO_DID } from '$env/static/public';
import { getPDSAgent } from '@ewanc26/atproto';
import { decodeTid } from '@ewanc26/tid';
import type { KofiEventType } from '@ewanc26/supporters';

export type { KofiEventType };

const COLLECTION = 'uk.ewancroft.kofi.supporter';

export interface KofiSupportEvent {
	rkey: string;
	name: string;
	type: KofiEventType;
	tier?: string;
	date: Date;
}

export async function fetchSupporters(): Promise<KofiSupportEvent[]> {
	const agent = await getPDSAgent(PUBLIC_ATPROTO_DID);
	const events: KofiSupportEvent[] = [];
	let cursor: string | undefined;

	do {
		const res = await agent.com.atproto.repo.listRecords({
			repo: PUBLIC_ATPROTO_DID,
			collection: COLLECTION,
			limit: 100,
			cursor
		});

		for (const record of res.data.records) {
			const value = record.value as { name: string; type: KofiEventType; tier?: string };
			const rkey = record.uri.split('/').pop() ?? '';
			let date: Date;
			try {
				date = decodeTid(rkey).date;
			} catch {
				date = new Date(0);
			}
			events.push({ rkey, name: value.name, type: value.type, tier: value.tier, date });
		}

		cursor = res.data.cursor;
	} while (cursor);

	// Most recent first
	return events.sort((a, b) => b.date.getTime() - a.date.getTime());
}
