/**
 * Slug to Publication mapping data
 *
 * Maps friendly URL slugs to publication rkeys from Leaflet or Standard.site.
 * This allows you to access publications via /{slug} instead of using rkeys.
 *
 * Example:
 * - /blog → maps to Leaflet publication with rkey "3m3x4bgbsh22k"
 * - /notes → maps to Standard.site publication with rkey "xyz123abc"
 */

export type PublicationPlatform = 'leaflet' | 'standard.site';

export interface SlugMapping {
	/** The URL-friendly slug (will be normalized automatically) */
	slug: string;
	/** The publication rkey */
	publicationRkey: string;
	/** The platform this publication belongs to (defaults to 'leaflet' for backwards compatibility) */
	platform?: PublicationPlatform;
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
		publicationRkey: '3m3x4bgbsh22k', // my blog publication rkey
		platform: 'leaflet'
	},
	{
		slug: 'cailean',
		publicationRkey: '3m4222fxc3k2q', // Cailean Uen's publication rkey for his journal
		platform: 'leaflet'
	},
	{
		slug: 'creativity',
		publicationRkey: '3m6afhzlxt22p', // my creativity dump publication rkey
		platform: 'leaflet'
	}
	// Add more mappings as needed:
	// { slug: 'notes', publicationRkey: 'xyz123abc', platform: 'standard.site' },
	// { slug: 'essays', publicationRkey: 'def456ghi', platform: 'leaflet' },
];
