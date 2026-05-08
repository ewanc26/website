/**
 * Firehose / Jetstream configuration
 *
 * Real-time updates via the Europe Jetstream relay.
 * The browser connects directly — no server proxy needed.
 */

/** London Jetstream endpoint (relays from europe.firehose.network, 72h replay). */
export const JETSTREAM_ENDPOINT = 'wss://london.firehose.stream/tap';

/** Frankfurt fallback (24h replay). */
export const JETSTREAM_FALLBACK_ENDPOINT = 'wss://frankfurt.firehose.stream/tap';

/**
 * Collections the website cares about, mapped to the card
 * that should update when a record in that collection changes.
 *
 * The key is the AT Protocol collection NSID.
 * The value is a human-readable card identifier used for
 * dispatching updates in the firehose store.
 */
export const FIREHOSE_COLLECTIONS = {
	'app.bsky.actor.profile': 'profile',
	'social.kibun.status': 'kibun',
	'fm.teal.alpha.actor.status': 'music',
	'fm.teal.alpha.feed.play': 'music',
	'app.bsky.feed.post': 'bluesky-post',
	'blue.linkat.board': 'links',
	'site.standard.document': 'documents',
	'uk.ewancroft.support.kofi': 'supporters',
	'uk.ewancroft.support.github': 'supporters',
	'social.popfeed.feed.review': 'popfeed',
	'uk.ewancroft.site.info': 'site-info'
} as const;

export type FirehoseCollection = (typeof FIREHOSE_COLLECTIONS)[keyof typeof FIREHOSE_COLLECTIONS];

/** Reconnect backoff: start at 1s, double each attempt, cap at 60s. */
export const RECONNECT_BASE_DELAY = 1_000;
export const RECONNECT_MAX_DELAY = 60_000;

/** Heartbeat interval — send a ping if no message received in 30s. */
export const HEARTBEAT_INTERVAL = 30_000;
