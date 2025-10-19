import { AtpAgent } from '@atproto/api';
import type { ResolvedIdentity } from './types';

// Default fallback agent for public Bluesky API calls
export const defaultAgent = new AtpAgent({ service: 'https://public.api.bsky.app' });

// Cached agents
let resolvedAgent: AtpAgent | null = null;
let pdsAgent: AtpAgent | null = null;

/**
 * Resolves a DID to find its PDS endpoint using Slingshot.
 */
export async function resolveIdentity(did: string): Promise<ResolvedIdentity> {
	const response = await fetch(
		`https://slingshot.microcosm.blue/xrpc/com.bad-example.identity.resolveMiniDoc?identifier=${encodeURIComponent(did)}`
	);

	if (!response.ok) {
		throw new Error(`Failed to resolve identifier: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();

	if (!data.did || !data.pds) {
		throw new Error('Invalid response from identity resolver');
	}

	return data;
}

/**
 * Gets or creates an agent for the public Bluesky API with PDS fallback
 */
export async function getPublicAgent(did: string): Promise<AtpAgent> {
	if (resolvedAgent) return resolvedAgent;

	try {
		const resolved = await resolveIdentity(did);
		resolvedAgent = new AtpAgent({ service: resolved.pds });
		return resolvedAgent;
	} catch (err) {
		console.error('Failed to resolve DID via Slingshot, falling back:', err);
		resolvedAgent = defaultAgent;
		return resolvedAgent;
	}
}

/**
 * Gets or creates a PDS-specific agent
 */
export async function getPDSAgent(did: string): Promise<AtpAgent> {
	if (pdsAgent) return pdsAgent;

	try {
		const resolved = await resolveIdentity(did);
		pdsAgent = new AtpAgent({ service: resolved.pds });
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
	usePDSFirst = false
): Promise<T> {
	const agents = usePDSFirst
		? [() => getPDSAgent(did), () => Promise.resolve(defaultAgent)]
		: [() => Promise.resolve(defaultAgent), () => getPDSAgent(did)];

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
