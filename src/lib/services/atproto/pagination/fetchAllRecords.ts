import { withFallback } from '$lib/services/atproto/agents';
import { PUBLIC_ATPROTO_DID } from '$env/static/public';

/**
 * Configuration for fetching paginated records
 */
export interface FetchRecordsConfig {
	/** The repository DID to fetch from */
	repo: string;
	/** The AT Protocol collection to fetch from */
	collection: string;
	/** Number of records to fetch per page (max 100) */
	limit?: number;
	/** Optional fetch function for SSR */
	fetchFn?: typeof fetch;
}

/**
 * Type for AT Protocol record response
 */
export interface AtProtoRecord<T = any> {
	uri: string;
	value: T;
	cid?: string;
}

/**
 * Generic function to fetch all records from an AT Protocol collection with automatic pagination.
 *
 * @param config - Configuration object for the fetch operation
 * @returns Promise resolving to array of all records
 *
 * @example
 * ```ts
 * const posts = await fetchAllRecords({
 *   repo: PUBLIC_ATPROTO_DID,
 *   collection: 'com.whtwnd.blog.entry',
 *   fetchFn: fetch
 * });
 * ```
 */
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

/**
 * Convenience function to fetch all records from the configured user's repository
 */
export async function fetchAllUserRecords<T = any>(
	collection: string,
	fetchFn?: typeof fetch,
	limit?: number
): Promise<AtProtoRecord<T>[]> {
	return fetchAllRecords<T>({
		repo: PUBLIC_ATPROTO_DID,
		collection,
		limit,
		fetchFn
	});
}
