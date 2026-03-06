import { withFallback } from '../agents.js';

export interface FetchRecordsConfig {
	repo: string;
	collection: string;
	limit?: number;
	fetchFn?: typeof fetch;
}

export interface AtProtoRecord<T = any> {
	uri: string;
	value: T;
	cid?: string;
}

export async function fetchAllRecords<T = any>(
	config: FetchRecordsConfig
): Promise<AtProtoRecord<T>[]> {
	const { repo, collection, limit = 100, fetchFn } = config;
	const allRecords: AtProtoRecord<T>[] = [];
	let cursor: string | undefined;

	try {
		do {
			const records = await withFallback(
				repo,
				async (agent) => {
					const response = await agent.com.atproto.repo.listRecords({
						repo,
						collection,
						limit,
						cursor
					});
					cursor = response.data.cursor;
					return response.data.records;
				},
				true,
				fetchFn
			);
			allRecords.push(...(records as AtProtoRecord<T>[]));
		} while (cursor);
	} catch (error) {
		console.warn(`Failed to fetch records from ${collection}:`, error);
		throw error;
	}

	return allRecords;
}

export async function fetchAllUserRecords<T = any>(
	did: string,
	collection: string,
	fetchFn?: typeof fetch,
	limit?: number
): Promise<AtProtoRecord<T>[]> {
	return fetchAllRecords<T>({ repo: did, collection, limit, fetchFn });
}
