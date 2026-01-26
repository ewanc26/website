/**
 * Standard.site Document Service
 *
 * Based on: /Volumes/Storage/Developer/clones/docs.surf/packages/server/src/utils/document.ts
 *
 * This service handles fetching, resolving, and caching Standard.site documents and publications.
 * All legacy platform support (WhiteWind, Leaflet) has been removed.
 */

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
 * Raw document record from PDS (matches docs.surf pattern)
 */
interface DocumentRecord {
	site: string;
	path?: string;
	title: string;
	description?: string;
	coverImage?: unknown;
	content?: unknown;
	textContent?: string;
	bskyPostRef?: { uri: string; cid: string };
	tags?: string[];
	publishedAt: string;
	updatedAt?: string;
}

/**
 * Raw publication record from PDS (matches docs.surf pattern)
 */
interface PublicationRecord {
	url: string;
	name: string;
	description?: string;
	icon?: unknown;
	basicTheme?: {
		background: StandardSiteThemeColor;
		foreground: StandardSiteThemeColor;
		accent: StandardSiteThemeColor;
		accentForeground: StandardSiteThemeColor;
	};
	preferences?: {
		showInDiscover?: boolean;
	};
}

/**
 * Fetches a single publication record from an at:// URI
 * Based on docs.surf fetchPublication()
 */
async function fetchPublicationByUri(
	publicationUri: string,
	fetchFn?: typeof fetch
): Promise<StandardSitePublication | null> {
	// Extract rkey from URI
	const rkey = publicationUri.split('/').pop();
	if (!rkey) return null;

	try {
		const record = await withFallback(
			PUBLIC_ATPROTO_DID,
			async (agent) => {
				const response = await agent.com.atproto.repo.getRecord({
					repo: PUBLIC_ATPROTO_DID,
					collection: 'site.standard.publication',
					rkey
				});
				return response.data;
			},
			true,
			fetchFn
		);

		if (!record) return null;

		const pubValue = record.value as unknown as PublicationRecord;
		if (!pubValue.url || !pubValue.name) return null;

		// Resolve icon blob URL if present
		const icon = pubValue.icon ? await getBlobUrl(pubValue.icon, fetchFn) : undefined;

		// Extract basic theme if present
		let basicTheme: StandardSiteBasicTheme | undefined;
		if (pubValue.basicTheme) {
			basicTheme = {
				background: pubValue.basicTheme.background,
				foreground: pubValue.basicTheme.foreground,
				accent: pubValue.basicTheme.accent,
				accentForeground: pubValue.basicTheme.accentForeground
			};
		}

		return {
			name: pubValue.name,
			rkey,
			uri: publicationUri,
			url: pubValue.url,
			description: pubValue.description,
			icon,
			basicTheme,
			preferences: pubValue.preferences
		};
	} catch (error) {
		console.warn(`Failed to fetch publication ${publicationUri}:`, error);
		return null;
	}
}

/**
 * Resolves the canonical view URL for a document
 * Always uses external publication URLs
 */
function resolveViewUrl(
	site: string,
	path: string | undefined,
	publicationUrl: string | undefined,
	rkey: string
): string {
	// Determine document path (use path if provided, otherwise fallback to /rkey)
	const docPath = path || `/${rkey}`;

	// Ensure path starts with /
	const normalizedPath = docPath.startsWith('/') ? docPath : `/${docPath}`;

	// Check if site is a publication URI (at://) or direct URL
	if (site.startsWith('at://')) {
		// Publication-based document
		if (!publicationUrl) {
			// Shouldn't happen, but fallback to using the URI
			console.warn(`Missing publication URL for document with site: ${site}`);
			return `${site}${normalizedPath}`;
		}

		// Use the publication's external URL
		const baseUrl = publicationUrl.startsWith('http')
			? publicationUrl
			: `https://${publicationUrl}`;

		// Remove trailing slash and construct URL
		return `${baseUrl.replace(/\/$/, '')}${normalizedPath}`;
	} else {
		// Loose document with direct URL
		const baseUrl = site.startsWith('http') ? site : `https://${site}`;

		// Remove trailing slash and construct URL
		return `${baseUrl.replace(/\/$/, '')}${normalizedPath}`;
	}
}

/**
 * Helper function to get a blob URL
 * Based on docs.surf buildBlobUrl()
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

/**
 * Fetches all Standard.site publications for a user
 */
export async function fetchPublications(
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
		console.debug('[Standard.site] Querying publication records');
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
			const pubValue = pubRecord.value as unknown as PublicationRecord;
			const rkey = pubRecord.uri.split('/').pop() || '';

			// Resolve icon blob URL if present
			const icon = pubValue.icon ? await getBlobUrl(pubValue.icon, fetchFn) : undefined;

			// Extract basic theme if present
			let basicTheme: StandardSiteBasicTheme | undefined;
			if (pubValue.basicTheme) {
				basicTheme = {
					background: pubValue.basicTheme.background,
					foreground: pubValue.basicTheme.foreground,
					accent: pubValue.basicTheme.accent,
					accentForeground: pubValue.basicTheme.accentForeground
				};
			}

			publications.push({
				name: pubValue.name,
				rkey,
				uri: pubRecord.uri,
				url: pubValue.url,
				description: pubValue.description,
				icon,
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
 * Based on docs.surf processDocument() pattern
 */
export async function fetchDocuments(fetchFn?: typeof fetch): Promise<StandardSiteDocumentsData> {
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
		// Fetch all publications first to map URIs to publication data
		const publicationsData = await fetchPublications(fetchFn);
		const publicationsMap = new Map<string, StandardSitePublication>();

		for (const pub of publicationsData.publications) {
			publicationsMap.set(pub.uri, pub);
		}

		console.debug('[Standard.site] Querying document records');
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
			const docValue = docRecord.value as unknown as DocumentRecord;
			const rkey = docRecord.uri.split('/').pop() || '';

			// Extract fields from document record
			const site = docValue.site;
			const path = docValue.path;
			const title = docValue.title;
			const description = docValue.description;
			const textContent = docValue.textContent;
			const content = docValue.content;
			const bskyPostRef = docValue.bskyPostRef;
			const tags = docValue.tags;
			const publishedAt = docValue.publishedAt;
			const updatedAt = docValue.updatedAt;

			// Resolve publication if site is at:// URI
			let publication: StandardSitePublication | undefined;
			let publicationRkey: string | undefined;
			let pubUrl: string | undefined;

			if (site.startsWith('at://')) {
				// Publication-based document
				publication = publicationsMap.get(site);
				publicationRkey = site.split('/').pop();
				pubUrl = publication?.url;
			} else {
				// Loose document - site is the base URL
				pubUrl = site;
			}

			// Construct canonical view URL
			const url = resolveViewUrl(site, path, pubUrl, rkey);

			// Resolve cover image blob URL if present
			const coverImage = docValue.coverImage
				? await getBlobUrl(docValue.coverImage, fetchFn)
				: undefined;

			documents.push({
				title,
				rkey,
				uri: docRecord.uri,
				url,
				site,
				path,
				description,
				coverImage,
				content,
				textContent,
				bskyPostRef,
				tags,
				publishedAt,
				updatedAt,
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
 * Fetches recent documents (top N)
 */
export async function fetchRecentDocuments(
	limit: number = 5,
	fetchFn?: typeof fetch
): Promise<StandardSiteDocument[]> {
	const { documents } = await fetchDocuments(fetchFn);
	return documents.slice(0, limit);
}

/**
 * Converts Standard.site documents to BlogPost format
 */
function convertDocumentToBlogPost(doc: StandardSiteDocument): import('./types').BlogPost {
	return {
		title: doc.title,
		url: doc.url,
		createdAt: doc.publishedAt,
		platform: 'standard.site',
		description: doc.description,
		rkey: doc.rkey,
		publicationName: doc.publicationName,
		publicationRkey: doc.publicationRkey,
		tags: doc.tags,
		coverImage: doc.coverImage,
		textContent: doc.textContent,
		updatedAt: doc.updatedAt
	};
}

/**
 * Fetches blog posts from Standard.site documents
 */
export async function fetchBlogPosts(
	fetchFn?: typeof fetch
): Promise<{ posts: import('./types').BlogPost[] }> {
	const { documents } = await fetchDocuments(fetchFn);
	const posts = documents.map(convertDocumentToBlogPost);
	return { posts };
}
