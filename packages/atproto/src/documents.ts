import { cache } from './cache.js';
import { withFallback, resolveIdentity } from './agents.js';
import { buildPdsBlobUrl } from './media.js';
import type {
	StandardSitePublication,
	StandardSitePublicationsData,
	StandardSiteDocument,
	StandardSiteDocumentsData,
	StandardSiteBasicTheme,
	StandardSiteThemeColor,
	BlogPost
} from './types.js';

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
	preferences?: { showInDiscover?: boolean };
}

async function getBlobUrl(
	did: string,
	blob: any,
	fetchFn?: typeof fetch
): Promise<string | undefined> {
	try {
		const cid = blob.ref?.$link || blob.cid;
		if (!cid) return undefined;
		const resolved = await resolveIdentity(did, fetchFn);
		return buildPdsBlobUrl(resolved.pds, did, cid);
	} catch {
		return undefined;
	}
}

function resolveViewUrl(
	site: string,
	path: string | undefined,
	publicationUrl: string | undefined,
	rkey: string
): string {
	const docPath = path || `/${rkey}`;
	const normalizedPath = docPath.startsWith('/') ? docPath : `/${docPath}`;

	if (site.startsWith('at://')) {
		if (!publicationUrl) return `${site}${normalizedPath}`;
		const baseUrl = publicationUrl.startsWith('http') ? publicationUrl : `https://${publicationUrl}`;
		return `${baseUrl.replace(/\/$/, '')}${normalizedPath}`;
	} else {
		const baseUrl = site.startsWith('http') ? site : `https://${site}`;
		return `${baseUrl.replace(/\/$/, '')}${normalizedPath}`;
	}
}

export async function fetchPublications(
	did: string,
	fetchFn?: typeof fetch
): Promise<StandardSitePublicationsData> {
	const cacheKey = `standard-site:publications:${did}`;
	const cached = cache.get<StandardSitePublicationsData>(cacheKey);
	if (cached) return cached;

	const publications: StandardSitePublication[] = [];

	try {
		const publicationsRecords = await withFallback(
			did,
			async (agent) => {
				const response = await agent.com.atproto.repo.listRecords({
					repo: did,
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
				icon: pubValue.icon ? await getBlobUrl(did, pubValue.icon, fetchFn) : undefined,
				basicTheme,
				preferences: pubValue.preferences
			});
		}

		const data: StandardSitePublicationsData = { publications };
		cache.set(cacheKey, data);
		return data;
	} catch {
		return { publications: [] };
	}
}

export async function fetchDocuments(
	did: string,
	fetchFn?: typeof fetch
): Promise<StandardSiteDocumentsData> {
	const cacheKey = `standard-site:documents:${did}`;
	const cached = cache.get<StandardSiteDocumentsData>(cacheKey);
	if (cached) return cached;

	const documents: StandardSiteDocument[] = [];

	try {
		const publicationsData = await fetchPublications(did, fetchFn);
		const publicationsMap = new Map<string, StandardSitePublication>();
		for (const pub of publicationsData.publications) {
			publicationsMap.set(pub.uri, pub);
		}

		const documentsRecords = await withFallback(
			did,
			async (agent) => {
				const response = await agent.com.atproto.repo.listRecords({
					repo: did,
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

			const site = docValue.site;
			let publication: StandardSitePublication | undefined;
			let publicationRkey: string | undefined;
			let pubUrl: string | undefined;

			if (site.startsWith('at://')) {
				publication = publicationsMap.get(site);
				publicationRkey = site.split('/').pop();
				pubUrl = publication?.url;
			} else {
				pubUrl = site;
			}

			const url = resolveViewUrl(site, docValue.path, pubUrl, rkey);
			const coverImage = docValue.coverImage
				? await getBlobUrl(did, docValue.coverImage, fetchFn)
				: undefined;

			documents.push({
				title: docValue.title,
				rkey,
				uri: docRecord.uri,
				url,
				site,
				path: docValue.path,
				description: docValue.description,
				coverImage,
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

		documents.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

		const data: StandardSiteDocumentsData = { documents };
		cache.set(cacheKey, data);
		return data;
	} catch {
		return { documents: [] };
	}
}

export async function fetchRecentDocuments(
	did: string,
	limit = 5,
	fetchFn?: typeof fetch
): Promise<StandardSiteDocument[]> {
	const { documents } = await fetchDocuments(did, fetchFn);
	return documents.slice(0, limit);
}

export async function fetchBlogPosts(
	did: string,
	fetchFn?: typeof fetch
): Promise<{ posts: BlogPost[] }> {
	const { documents } = await fetchDocuments(did, fetchFn);
	const posts: BlogPost[] = documents.map((doc) => ({
		title: doc.title,
		url: doc.url,
		createdAt: doc.publishedAt,
		platform: 'standard.site' as const,
		description: doc.description,
		rkey: doc.rkey,
		publicationName: doc.publicationName,
		publicationRkey: doc.publicationRkey,
		tags: doc.tags,
		coverImage: doc.coverImage,
		textContent: doc.textContent,
		updatedAt: doc.updatedAt
	}));
	return { posts };
}
