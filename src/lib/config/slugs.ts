/**
 * Slug to Leaflet Publication mapping configuration
 * 
 * Maps friendly URL slugs to Leaflet publication rkeys.
 * This allows you to access publications via /{slug} instead of /blog
 * 
 * Example:
 * - /blog → maps to publication with rkey "3m3x4bgbsh22k"
 * - /notes → maps to publication with rkey "xyz123abc"
 */

export interface SlugMapping {
	/** The URL-friendly slug */
	slug: string;
	/** The Leaflet publication rkey */
	publicationRkey: string;
}

/**
 * Slug to publication rkey mappings
 * Add your custom mappings here
 */
export const slugMappings: SlugMapping[] = [
	{
		slug: 'blog',
		publicationRkey: '3m3x4bgbsh22k' // my blog publication rkey
	},
	{
		slug: 'cailean',
		publicationRkey: '3m4222fxc3k2q' // Cailean Uen's publication rkey for his journal
	}
	// Add more mappings as needed:
	// { slug: 'notes', publicationRkey: 'xyz123abc' },
	// { slug: 'essays', publicationRkey: 'def456ghi' },
];

/**
 * Get publication rkey from slug
 */
export function getPublicationRkeyFromSlug(slug: string): string | null {
	const mapping = slugMappings.find(m => m.slug === slug);
	return mapping?.publicationRkey || null;
}

/**
 * Get slug from publication rkey
 */
export function getSlugFromPublicationRkey(rkey: string): string | null {
	const mapping = slugMappings.find(m => m.publicationRkey === rkey);
	return mapping?.slug || null;
}

/**
 * Get all configured slugs
 */
export function getAllSlugs(): string[] {
	return slugMappings.map(m => m.slug);
}
