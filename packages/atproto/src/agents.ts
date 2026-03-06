import { AtpAgent } from '@atproto/api';
import type { ResolvedIdentity } from './types.js';
import { cache } from './cache.js';

export function createAgent(service: string, fetchFn?: typeof fetch): AtpAgent {
	const wrappedFetch = fetchFn
		? async (url: URL | RequestInfo, init?: RequestInit) => {
				const urlStr = url instanceof URL ? url.toString() : url;
				const response = await fetchFn(urlStr, init);
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

export const constellationAgent = createAgent('https://constellation.microcosm.blue');
export const defaultAgent = createAgent('https://public.api.bsky.app');

let resolvedAgent: AtpAgent | null = null;
let pdsAgent: AtpAgent | null = null;

export async function resolveIdentity(
	did: string,
	fetchFn?: typeof fetch
): Promise<ResolvedIdentity> {
	const cacheKey = `identity:${did}`;
	const cached = cache.get<ResolvedIdentity>(cacheKey);
	if (cached) return cached;

	const _fetch = fetchFn ?? globalThis.fetch;
	const response = await _fetch(
		`https://slingshot.microcosm.blue/xrpc/com.bad-example.identity.resolveMiniDoc?identifier=${encodeURIComponent(did)}`
	);

	if (!response.ok) {
		throw new Error(
			`Failed to resolve identifier via Slingshot: ${response.status} ${response.statusText}`
		);
	}

	const rawText = await response.text();
	let data: any;
	try {
		data = JSON.parse(rawText);
	} catch (err) {
		throw new Error('Failed to parse identity resolver response');
	}

	if (!data.did || !data.pds) {
		throw new Error('Invalid response from identity resolver');
	}

	cache.set(cacheKey, data);
	return data;
}

export async function getPublicAgent(did: string, fetchFn?: typeof fetch): Promise<AtpAgent> {
	if (resolvedAgent) return resolvedAgent;

	try {
		try {
			const response = await constellationAgent.getProfile({ actor: did });
			if (response.success) {
				resolvedAgent = constellationAgent;
				return resolvedAgent;
			}
		} catch {
			// fall through
		}

		const resolved = await resolveIdentity(did, fetchFn);
		resolvedAgent = createAgent(resolved.pds, fetchFn);
		return resolvedAgent;
	} catch {
		resolvedAgent = defaultAgent;
		return resolvedAgent;
	}
}

export async function getPDSAgent(did: string, fetchFn?: typeof fetch): Promise<AtpAgent> {
	if (pdsAgent) return pdsAgent;
	const resolved = await resolveIdentity(did, fetchFn);
	pdsAgent = createAgent(resolved.pds, fetchFn);
	return pdsAgent;
}

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
			lastError = error;
		}
	}
	throw lastError;
}

export function resetAgents(): void {
	resolvedAgent = null;
	pdsAgent = null;
}
