/**
 * Ko-fi supporters service
 *
 * Reads uk.ewancroft.kofi.supporter records from the PDS and aggregates them
 * into KofiSupporter objects. No auth required — records are publicly readable.
 *
 * The PDS URL is resolved automatically from PUBLIC_ATPROTO_DID via resolveIdentity.
 * No additional environment variables are needed for the read path.
 */

import { PUBLIC_ATPROTO_DID } from '$env/static/public';
import { getPDSAgent } from '@ewanc26/atproto';
import type { KofiSupporter, KofiEventType } from '@ewanc26/supporters';

export type { KofiSupporter, KofiEventType };

const COLLECTION = 'uk.ewancroft.kofi.supporter';

interface KofiEventRecord {
	name: string;
	type: KofiEventType;
	tier?: string;
}

function dedupe<T>(arr: T[], extra: T): T[] {
	return Array.from(new Set([...arr, extra]));
}

function aggregateEvents(events: KofiEventRecord[]): KofiSupporter[] {
	const map = new Map<string, KofiSupporter>();

	for (const event of events) {
		const existing = map.get(event.name);
		map.set(event.name, {
			name: event.name,
			types: dedupe(existing?.types ?? [], event.type),
			tiers: event.tier ? dedupe(existing?.tiers ?? [], event.tier) : (existing?.tiers ?? [])
		});
	}

	return Array.from(map.values());
}

export async function fetchSupporters(): Promise<KofiSupporter[]> {
	const agent = await getPDSAgent(PUBLIC_ATPROTO_DID);
	const events: KofiEventRecord[] = [];
	let cursor: string | undefined;

	do {
		const res = await agent.com.atproto.repo.listRecords({
			repo: PUBLIC_ATPROTO_DID,
			collection: COLLECTION,
			limit: 100,
			cursor
		});

		for (const record of res.data.records) {
			events.push(record.value as unknown as KofiEventRecord);
		}

		cursor = res.data.cursor;
	} while (cursor);

	return aggregateEvents(events);
}
