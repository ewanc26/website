/**
 * Slug to Leaflet Publication mapping data
 *
 * Maps friendly URL slugs to Leaflet publication rkeys.
 * This allows you to access publications via /{slug} instead of /blog
 *
 * Example:
 * - /blog → maps to publication with rkey "3m3x4bgbsh22k"
 * - /notes → maps to publication with rkey "xyz123abc"
 */

export interface SlugMapping {
	/** The URL-friendly slug (will be normalized automatically) */
	slug: string;
	/** The Leaflet publication rkey */
	publicationRkey: string;
}

/**
 * Slug to publication rkey mappings
 * Add your custom mappings here
 *
 * Note: Slugs will be automatically normalized to be URI-compatible:
 * - Converted to lowercase
 * - Spaces converted to hyphens
 * - Special characters removed
 * - Multiple hyphens collapsed to single hyphen
 */
export const slugMappings: SlugMapping[] = [
	{
		slug: 'blog',
		publicationRkey: '3m3x4bgbsh22k' // my blog publication rkey
	},
	{
		slug: 'cailean',
		publicationRkey: '3m4222fxc3k2q' // Cailean Uen's publication rkey for his journal
	},
	{
		slug: 'creativity',
		publicationRkey: '3m6afhzlxt22p' // my creativity dump publication rkey
	},
	// Add more mappings as needed:
	// { slug: 'notes', publicationRkey: 'xyz123abc' },
	// { slug: 'essays', publicationRkey: 'def456ghi' },
];
