import { PUBLIC_ATPROTO_DID } from '$env/static/public';
import { cache } from './cache';
import { withFallback, resolveIdentity } from './agents';
import { buildPdsBlobUrl } from './media';
import type {
	StandardSitePublication,
	StandardSitePublicationsData,
	StandardSiteDocument,
	StandardSiteDocumentsData,
	StandardSiteBasicTheme,
	StandardSiteThemeColor
} from './types';

/**
 * Fetches all Standard.site publications for a user
 */
export async function fetchStandardSitePublications(
	fetchFn?: typeof fetch
): Promise<StandardSitePublicationsData> {
	console.info('[Standard.site] Fetching publications');
	const cacheKey = `standard-site:publications:${PUBLIC_ATPROTO_DID}`;
	const cached = cache.get<StandardSitePublicationsData>(cacheKey);
	if (cached) {
		console.debug('[Standard.site] Returning cached publications');
		return cached;
	}

	const publications: StandardSitePublication[] = [];
	console.info('[Standard.site] Cache miss, fetching from network');

	try {
		console.debug('[Standard.site] Querying publications records');
		const publicationsRecords = await withFallback(
			PUBLIC_ATPROTO_DID,
			async (agent) => {
				const response = await agent.com.atproto.repo.listRecords({
					repo: PUBLIC_ATPROTO_DID,
					collection: 'site.standard.publication',
					limit: 100
				});
				return response.data.records;
			},
			true,
			fetchFn
		);

		for (const pubRecord of publicationsRecords) {
			const pubValue = pubRecord.value as any;
			const rkey = pubRecord.uri.split('/').pop() || '';

			// Extract basic theme if present
			let basicTheme: StandardSiteBasicTheme | undefined;
			if (pubValue.basicTheme) {
				const theme = pubValue.basicTheme;
				basicTheme = {
					background: theme.background as StandardSiteThemeColor,
					foreground: theme.foreground as StandardSiteThemeColor,
					accent: theme.accent as StandardSiteThemeColor,
					accentForeground: theme.accentForeground as StandardSiteThemeColor
				};
			}

			publications.push({
				name: pubValue.name || 'Untitled Publication',
				rkey,
				uri: pubRecord.uri,
				url: pubValue.url,
				description: pubValue.description,
				icon: pubValue.icon ? await getBlobUrl(pubValue.icon, fetchFn) : undefined,
				basicTheme,
				preferences: pubValue.preferences
			});
		}

		const data: StandardSitePublicationsData = { publications };
		cache.set(cacheKey, data);
		return data;
	} catch (error) {
		console.warn('Failed to fetch Standard.site publications:', error);
		return { publications: [] };
	}
}

/**
 * Fetches all Standard.site documents for a user
 */
export async function fetchStandardSiteDocuments(
	fetchFn?: typeof fetch
): Promise<StandardSiteDocumentsData> {
	console.info('[Standard.site] Fetching documents');
	const cacheKey = `standard-site:documents:${PUBLIC_ATPROTO_DID}`;
	const cached = cache.get<StandardSiteDocumentsData>(cacheKey);
	if (cached) {
		console.debug('[Standard.site] Returning cached documents');
		return cached;
	}

	const documents: StandardSiteDocument[] = [];
	console.info('[Standard.site] Cache miss, fetching from network');

	try {
		// Get all publications first to map URIs to publication data
		const publicationsData = await fetchStandardSitePublications(fetchFn);
		const publicationsMap = new Map<string, StandardSitePublication>();
		for (const pub of publicationsData.publications) {
			publicationsMap.set(pub.uri, pub);
		}

		console.debug('[Standard.site] Querying documents records');
		const documentsRecords = await withFallback(
			PUBLIC_ATPROTO_DID,
			async (agent) => {
				const response = await agent.com.atproto.repo.listRecords({
					repo: PUBLIC_ATPROTO_DID,
					collection: 'site.standard.document',
					limit: 100
				});
				return response.data.records;
			},
			true,
			fetchFn
		);

		for (const docRecord of documentsRecords) {
			const docValue = docRecord.value as any;
			const rkey = docRecord.uri.split('/').pop() || '';

			// Determine the publication info
			const siteValue = docValue.site;
			let publication: StandardSitePublication | undefined;
			let publicationRkey: string | undefined;
			let url: string;

			// Check if site points to a publication record (at://) or a URL (https://)
			if (siteValue.startsWith('at://')) {
				// It's a publication URI
				publication = publicationsMap.get(siteValue);
				publicationRkey = siteValue.split('/').pop();

				// Build URL from publication base URL + document path
				if (publication) {
					const basePath = publication.url.endsWith('/')
						? publication.url.slice(0, -1)
						: publication.url;
					const docPath = docValue.path || `/${rkey}`;
					url = `${basePath}${docPath.startsWith('/') ? docPath : '/' + docPath}`;
				} else {
					// Fallback if publication not found
					url = `${siteValue}${docValue.path || '/' + rkey}`;
				}
			} else {
				// It's a loose document with a direct URL
				const basePath = siteValue.endsWith('/') ? siteValue.slice(0, -1) : siteValue;
				const docPath = docValue.path || `/${rkey}`;
				url = `${basePath}${docPath.startsWith('/') ? docPath : '/' + docPath}`;
			}

			documents.push({
				title: docValue.title || 'Untitled Document',
				rkey,
				uri: docRecord.uri,
				url,
				site: docValue.site,
				path: docValue.path,
				description: docValue.description,
				coverImage: docValue.coverImage
					? await getBlobUrl(docValue.coverImage, fetchFn)
					: undefined,
				content: docValue.content,
				textContent: docValue.textContent,
				bskyPostRef: docValue.bskyPostRef,
				tags: docValue.tags,
				publishedAt: docValue.publishedAt,
				updatedAt: docValue.updatedAt,
				publicationName: publication?.name,
				publicationRkey
			});
		}

		// Sort by publishedAt (newest first)
		documents.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

		const data: StandardSiteDocumentsData = { documents };
		cache.set(cacheKey, data);
		return data;
	} catch (error) {
		console.warn('Failed to fetch Standard.site documents:', error);
		return { documents: [] };
	}
}

/**
 * Helper function to get a blob URL for Standard.site publication icons and document cover images
 */
async function getBlobUrl(blob: any, fetchFn?: typeof fetch): Promise<string | undefined> {
	try {
		const cid = blob.ref?.$link || blob.cid;
		if (!cid) return undefined;

		const resolved = await resolveIdentity(PUBLIC_ATPROTO_DID, fetchFn);
		return buildPdsBlobUrl(resolved.pds, PUBLIC_ATPROTO_DID, cid);
	} catch (error) {
		console.warn('Failed to resolve blob URL:', error);
		return undefined;
	}
}
