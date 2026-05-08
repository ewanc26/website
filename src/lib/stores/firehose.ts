/**
 * Firehose store — real-time AT Protocol updates via Jetstream
 *
 * Opens a WebSocket directly to the London Jetstream endpoint,
 * filtered to the site owner's DID. Dispatches collection-specific
 * updates to subscribers (cards, components).
 *
 * No server proxy needed — Jetstream is unauthenticated and
 * WebSocket connections bypass CORS.
 */

import { writable, derived, get } from 'svelte/store';
import { PUBLIC_ATPROTO_DID } from '$env/static/public';
import {
	JETSTREAM_ENDPOINT,
	JETSTREAM_FALLBACK_ENDPOINT,
	FIREHOSE_COLLECTIONS,
	RECONNECT_BASE_DELAY,
	RECONNECT_MAX_DELAY,
	HEARTBEAT_INTERVAL
} from '$lib/config/firehose.config';
import type { FirehoseCollection } from '$lib/config/firehose.config';

// --- Types ---

/** A Jetstream commit event. */
export interface JetstreamCommit {
	did: string;
	time_us: number;
	kind: 'commit';
	commit: {
		rev: string;
		operation: 'create' | 'update' | 'delete';
		collection: string;
		rkey: string;
		record?: Record<string, unknown>;
		cid?: string;
	};
}

/** A Jetstream identity event. */
export interface JetstreamIdentity {
	did: string;
	time_us: number;
	kind: 'identity';
	identity: {
		did: string;
		handle: string;
		seq: number;
	};
}

/** A Jetstream account event. */
export interface JetstreamAccount {
	did: string;
	time_us: number;
	kind: 'account';
	account: {
		active: boolean;
		did: string;
		seq: number;
	};
}

export type JetstreamEvent = JetstreamCommit | JetstreamIdentity | JetstreamAccount;

/** Callback for a collection-specific update. */
export type CollectionCallback = (event: JetstreamCommit) => void;

/** Connection status. */
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

// --- Internal state ---

let ws: WebSocket | null = null;
let reconnectAttempts = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let heartbeatTimer: ReturnType<typeof setTimeout> | null = null;
let lastTimeUs: number | null = null;
let isClosing = false;

/** Collection → Set of callbacks. */
const listeners = new Map<FirehoseCollection, Set<CollectionCallback>>();

/** Global callbacks (fire on every event). */
const globalListeners = new Set<(event: JetstreamEvent) => void>();

// --- Svelte stores ---

export const connectionStatus = writable<ConnectionStatus>('disconnected');

export const lastEventTime = writable<number | null>(null);

/** Derived: is the firehose connected and receiving events. */
export const isConnected = derived(connectionStatus, (s) => s === 'connected');

// --- URL construction ---

function buildUrl(endpoint: string, cursor?: number): string {
	const params = new URLSearchParams();
	params.set('wantedDids', PUBLIC_ATPROTO_DID);
	if (cursor) params.set('cursor', String(cursor));
	return `${endpoint}?${params.toString()}`;
}

// --- Connection management ---

function clearTimers() {
	if (reconnectTimer) {
		clearTimeout(reconnectTimer);
		reconnectTimer = null;
	}
	if (heartbeatTimer) {
		clearTimeout(heartbeatTimer);
		heartbeatTimer = null;
	}
}

function scheduleReconnect() {
	if (isClosing) return;
	clearTimers();

	const delay = Math.min(
		RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttempts),
		RECONNECT_MAX_DELAY
	);
	reconnectAttempts++;

	connectionStatus.set('reconnecting');
	reconnectTimer = setTimeout(connect, delay);
}

function resetHeartbeat() {
	if (heartbeatTimer) clearTimeout(heartbeatTimer);
	heartbeatTimer = setTimeout(() => {
		// No message received within the heartbeat interval —
		// the connection might be stale. Reconnect.
		if (ws) {
			ws.close();
		}
	}, HEARTBEAT_INTERVAL);
}

// --- Event dispatch ---

function dispatchEvent(event: JetstreamEvent) {
	lastEventTime.set(Date.now());

	if (event.kind !== 'commit') return;

	const collection = event.commit.collection;
	const cardId = FIREHOSE_COLLECTIONS[collection as keyof typeof FIREHOSE_COLLECTIONS];

	if (!cardId) return;

	// Dispatch to collection-specific listeners
	const callbacks = listeners.get(cardId as FirehoseCollection);
	if (callbacks) {
		for (const cb of callbacks) {
			try {
				cb(event);
			} catch (err) {
				console.error('[Firehose] Callback error:', err);
			}
		}
	}

	// Dispatch to global listeners
	for (const cb of globalListeners) {
		try {
			cb(event);
		} catch (err) {
			console.error('[Firehose] Global callback error:', err);
		}
	}
}

// --- Connect ---

export function connect() {
	if (isClosing) return;
	if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;

	clearTimers();
	connectionStatus.set('connecting');

	const endpoint = reconnectAttempts > 3 ? JETSTREAM_FALLBACK_ENDPOINT : JETSTREAM_ENDPOINT;
	const url = buildUrl(endpoint, lastTimeUs ?? undefined);

	try {
		ws = new WebSocket(url);
	} catch (err) {
		console.error('[Firehose] WebSocket creation failed:', err);
		scheduleReconnect();
		return;
	}

	ws.onopen = () => {
		connectionStatus.set('connected');
		reconnectAttempts = 0;
		resetHeartbeat();
	};

	ws.onmessage = (msg) => {
		resetHeartbeat();

		try {
			const event: JetstreamEvent = JSON.parse(msg.data);

			// Track cursor for gapless replay
			if (event.time_us) {
				lastTimeUs = event.time_us;
			}

			dispatchEvent(event);
		} catch {
			// Malformed JSON — ignore
		}
	};

	ws.onerror = () => {
		// onclose will fire after this
	};

	ws.onclose = () => {
		ws = null;
		connectionStatus.set('disconnected');
		scheduleReconnect();
	};
}

export function disconnect() {
	isClosing = true;
	clearTimers();
	if (ws) {
		ws.onclose = null;
		ws.close();
		ws = null;
	}
	connectionStatus.set('disconnected');
}

// --- Subscribe helpers ---

/**
 * Subscribe to updates for a specific card/collection.
 * Returns an unsubscribe function.
 */
export function onCollectionUpdate(
	cardId: FirehoseCollection,
	callback: CollectionCallback
): () => void {
	if (!listeners.has(cardId)) {
		listeners.set(cardId, new Set());
	}
	listeners.get(cardId)!.add(callback);

	return () => {
		const set = listeners.get(cardId);
		if (set) {
			set.delete(callback);
			if (set.size === 0) listeners.delete(cardId);
		}
	};
}

/**
 * Subscribe to all firehose events.
 * Returns an unsubscribe function.
 */
export function onEvent(callback: (event: JetstreamEvent) => void): () => void {
	globalListeners.add(callback);
	return () => {
		globalListeners.delete(callback);
	};
}

/**
 * Auto-connect when the first listener is added,
 * auto-disconnect when the last is removed.
 */
let autoConnectRefCount = 0;

export function subscribeAutoConnect(
	cardId: FirehoseCollection,
	callback: CollectionCallback
): () => void {
	const unsub = onCollectionUpdate(cardId, callback);
	autoConnectRefCount++;

	if (autoConnectRefCount === 1) {
		isClosing = false;
		connect();
	}

	return () => {
		unsub();
		autoConnectRefCount--;
		if (autoConnectRefCount <= 0) {
			autoConnectRefCount = 0;
			disconnect();
		}
	};
}
