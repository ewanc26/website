// standard.ts is superseded by documents.ts — re-export everything for backwards compat.
export {
	fetchPublications as fetchStandardSitePublications,
	fetchDocuments as fetchStandardSiteDocuments,
	fetchRecentDocuments as fetchRecentStandardSiteDocuments,
	fetchBlogPosts
} from './documents';
export type { StandardSitePublication, StandardSitePublicationsData, StandardSiteDocument, StandardSiteDocumentsData } from './documents';
