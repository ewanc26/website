import type { PageLoad } from './$types';
import { createSiteMeta, type SiteMetadata } from '$lib/helper/siteMeta';
import { fetchAllUserRecords } from '$lib/services/atproto/pagination';
import { PUBLIC_ATPROTO_DID } from '$env/static/public';
import type { BlogPost } from '$lib/services/atproto';

/**
 * Fetches ALL blog posts from WhiteWind and Leaflet with proper pagination
 */
async function fetchAllBlogPosts(fetchFn?: typeof fetch): Promise<BlogPost[]> {
	const posts: BlogPost[] = [];

	// Fetch WhiteWind posts with pagination
	try {
		const whiteWindRecords = await fetchAllUserRecords('com.whtwnd.blog.entry', fetchFn);

		for (const record of whiteWindRecords) {
			const value = record.value as any;
			// Skip drafts and non-public posts
			if (value.isDraft || (value.visibility && value.visibility !== 'public')) {
				continue;
			}

			posts.push({
				title: value.title || 'Untitled Post',
				url: `https://whtwnd.com/${PUBLIC_ATPROTO_DID}/${record.uri.split('/').pop()}`,
				createdAt: value.createdAt || record.value.createdAt || new Date().toISOString(),
				platform: 'WhiteWind',
				description: value.subtitle,
				rkey: record.uri.split('/').pop() || ''
			});
		}
	} catch (error) {
		console.warn('Failed to fetch WhiteWind posts:', error);
	}

	// Fetch Leaflet publications and documents with pagination
	try {
		// Fetch all publications
		const publicationsRecords = await fetchAllUserRecords('pub.leaflet.publication', fetchFn);

		const publicationsMap = new Map<string, { name: string; basePath?: string }>();
		for (const pubRecord of publicationsRecords) {
			const pubValue = pubRecord.value as any;
			publicationsMap.set(pubRecord.uri, {
				name: pubValue.name || 'Untitled Publication',
				basePath: pubValue.base_path
			});
		}

		// Fetch all Leaflet documents
		const leafletDocsRecords = await fetchAllUserRecords('pub.leaflet.document', fetchFn);

		for (const record of leafletDocsRecords) {
			const value = record.value as any;
			const rkey = record.uri.split('/').pop() || '';
			const publicationUri = value.publication;
			const publication = publicationsMap.get(publicationUri);

			// Determine URL based on priority: publication base_path → Leaflet /lish format
			let url: string;
			const publicationRkey = publicationUri ? publicationUri.split('/').pop() : '';

			if (publication?.basePath) {
				// Ensure basePath is a complete URL
				const basePath = publication.basePath.startsWith('http')
					? publication.basePath
					: `https://${publication.basePath}`;
				url = `${basePath}/${rkey}`;
			} else if (publicationRkey) {
				url = `https://leaflet.pub/lish/${PUBLIC_ATPROTO_DID}/${publicationRkey}/${rkey}`;
			} else {
				url = `https://leaflet.pub/${PUBLIC_ATPROTO_DID}/${rkey}`;
			}

			posts.push({
				title: value.title || 'Untitled Document',
				url,
				createdAt: value.publishedAt || new Date().toISOString(),
				platform: 'leaflet',
				description: value.description,
				rkey,
				publicationName: publication?.name,
				publicationRkey: publicationRkey || undefined
			});
		}
	} catch (error) {
		console.warn('Failed to fetch Leaflet documents:', error);
	}

	// Sort by date (newest first)
	posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

	return posts;
}

export const load: PageLoad = async ({ fetch }) => {
	// Fetch all blog posts
	let allPosts: BlogPost[] = [];

	try {
		allPosts = await fetchAllBlogPosts(fetch);
	} catch (err) {
		console.warn('Archive page: failed to fetch blog posts', err);
	}

	// Create page metadata
	const meta: Partial<SiteMetadata> = {
		title: 'Archive',
		description: `Browse all ${allPosts.length} blog posts organised by date`
	};

	return {
		meta,
		allPosts
	};
};
