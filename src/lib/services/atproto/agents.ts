import { AtpAgent } from '@atproto/api';
import type { ResolvedIdentity } from './types';

/**
 * Creates an AtpAgent with optional fetch function injection
 */
export function createAgent(service: string, fetchFn?: typeof fetch): AtpAgent {
	// If we have an injected fetch, wrap it to ensure we handle headers correctly
	const wrappedFetch = fetchFn
		? async (url: URL | RequestInfo, init?: RequestInit) => {
				// Convert URL to string if needed
				const urlStr = url instanceof URL ? url.toString() : url;

				// Make the request with the injected fetch
				const response = await fetchFn(urlStr, init);

				// Create a new response with the same body but add content-type if missing
				const headers = new Headers(response.headers);
				if (!headers.has('content-type')) {
					headers.set('content-type', 'application/json');
				}

				return new Response(response.body, {
					status: response.status,
					statusText: response.statusText,
					headers
				});
			}
		: undefined;

	return new AtpAgent({
		service,
		...(wrappedFetch && { fetch: wrappedFetch })
	});
}

// Primary Microcosm Constellation endpoint
export const constellationAgent = createAgent('https://constellation.microcosm.blue');

// Default fallback agent for public Bluesky API calls
export const defaultAgent = createAgent('https://public.api.bsky.app');

// Cached agents
let resolvedAgent: AtpAgent | null = null;
let pdsAgent: AtpAgent | null = null;

/**
 * Resolves a DID to find its PDS endpoint using Slingshot.
 */
export async function resolveIdentity(
	did: string,
	fetchFn?: typeof fetch
): Promise<ResolvedIdentity> {
	console.info(`[Identity] Resolving DID: ${did}`);

	// Prefer an injected fetch (from SvelteKit load), fall back to global fetch
	const _fetch = fetchFn ?? globalThis.fetch;

	const response = await _fetch(
		`https://slingshot.microcosm.blue/xrpc/com.bad-example.identity.resolveMiniDoc?identifier=${encodeURIComponent(
			did
		)}`
	);

	if (!response.ok) {
		console.error(`[Identity] Resolution failed: ${response.status} ${response.statusText}`);
		throw new Error(
			`Failed to resolve identifier via Slingshot: ${response.status} ${response.statusText}`
		);
	}

	// Some fetch implementations in Node (undici wrappers) can throw when calling Response.clone().
	// Read the text once and parse it instead of cloning to avoid private field access errors.
	const rawText = await response.text();
	console.debug(`[Identity] Raw response:`, rawText);
	let data: any;
	try {
		data = JSON.parse(rawText);
	} catch (err) {
		console.error('[Identity] Failed to parse identity resolver response as JSON', err);
		throw err;
	}

	if (!data.did || !data.pds) {
		throw new Error('Invalid response from identity resolver');
	}

	return data;
}

/**
 * Gets or creates an agent for the public Bluesky API with PDS fallback
 */
export async function getPublicAgent(did: string, fetchFn?: typeof fetch): Promise<AtpAgent> {
	console.info(`[Agent] Getting public agent for DID: ${did}`);
	if (resolvedAgent) {
		console.debug('[Agent] Using cached agent');
		return resolvedAgent;
	}

	try {
		// Try Constellation first
		try {
			console.info('[Agent] Attempting Constellation endpoint');
			const response = await constellationAgent.getProfile({ actor: did });
			if (response.success) {
				console.info('[Agent] Successfully connected to Constellation');
				resolvedAgent = constellationAgent;
				return resolvedAgent;
			}
		} catch (constellationErr) {
			console.warn('[Agent] Constellation endpoint unreachable:', constellationErr);
		}

		// Then try Slingshot for PDS resolution
		console.info('[Agent] Attempting Slingshot resolution');
		const resolved = await resolveIdentity(did, fetchFn);
		console.info(`[Agent] Resolved PDS endpoint: ${resolved.pds}`);
		resolvedAgent = createAgent(resolved.pds, fetchFn);
		return resolvedAgent;
	} catch (err) {
		console.error('[Agent] All Microcosm endpoints failed, falling back to Bluesky:', err);
		resolvedAgent = defaultAgent;
		return resolvedAgent;
	}
} /**
 * Gets or creates a PDS-specific agent
 */
export async function getPDSAgent(did: string, fetchFn?: typeof fetch): Promise<AtpAgent> {
	if (pdsAgent) return pdsAgent;

	try {
		const resolved = await resolveIdentity(did, fetchFn);
		pdsAgent = createAgent(resolved.pds, fetchFn);
		return pdsAgent;
	} catch (err) {
		console.error('Failed to resolve PDS for DID:', err);
		throw err;
	}
}

/**
 * Executes a function with automatic fallback from Bluesky public API to user's PDS
 * @param did - The DID to resolve
 * @param operation - The operation to execute
 * @param usePDSFirst - If true, tries PDS first before public API
 */
export async function withFallback<T>(
	did: string,
	operation: (agent: AtpAgent) => Promise<T>,
	usePDSFirst = false,
	fetchFn?: typeof fetch
): Promise<T> {
	const defaultAgentFn = () =>
		fetchFn ? createAgent('https://public.api.bsky.app', fetchFn) : Promise.resolve(defaultAgent);

	const agents = usePDSFirst
		? [() => getPDSAgent(did, fetchFn), defaultAgentFn]
		: [defaultAgentFn, () => getPDSAgent(did, fetchFn)];

	let lastError: any;

	for (const getAgent of agents) {
		try {
			const agent = await getAgent();
			return await operation(agent);
		} catch (error) {
			console.warn('Operation failed, trying next agent:', error);
			lastError = error;
		}
	}

	throw lastError;
}

/**
 * Resets cached agents (useful for testing or when identity changes)
 */
export function resetAgents(): void {
	resolvedAgent = null;
	pdsAgent = null;
}
