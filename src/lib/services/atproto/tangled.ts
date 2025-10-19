import { PUBLIC_ATPROTO_DID } from '$env/static/public';
import { cache } from './cache';
import { withFallback } from './agents';

export interface TangledRepo {
	uri: string;
	name: string;
	description?: string;
	knot: string;
	createdAt: string;
	labels?: string[];
	source?: string;
	spindle?: string;
}

export interface TangledReposData {
	repos: TangledRepo[];
}

/**
 * Fetches Tangled repositories from AT Protocol
 */
export async function fetchTangledRepos(): Promise<TangledReposData | null> {
	const cacheKey = `tangled:${PUBLIC_ATPROTO_DID}`;
	const cached = cache.get<TangledReposData>(cacheKey);
	if (cached) return cached;

	try {
		// Custom collection, prefer PDS first
		const records = await withFallback(
			PUBLIC_ATPROTO_DID,
			async (agent) => {
				const response = await agent.com.atproto.repo.listRecords({
					repo: PUBLIC_ATPROTO_DID,
					collection: 'sh.tangled.repo',
					limit: 100
				});
				return response.data.records;
			},
			true
		); // usePDSFirst = true

		if (records.length === 0) return null;

		const repos: TangledRepo[] = records.map((record) => {
			const value = record.value as any;
			return {
				uri: record.uri,
				name: value.name,
				description: value.description,
				knot: value.knot,
				createdAt: value.createdAt,
				labels: value.labels,
				source: value.source,
				spindle: value.spindle
			};
		});

		// Sort by creation date, newest first
		repos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

		const data: TangledReposData = { repos };
		cache.set(cacheKey, data);
		return data;
	} catch (error) {
		console.error('Failed to fetch Tangled repos from all sources:', error);
		return null;
	}
}
