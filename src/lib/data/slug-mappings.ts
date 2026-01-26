/**
 * Slug to Publication mapping data
 *
 * Maps friendly URL slugs to Standard.site publication rkeys.
 * This allows you to access publications via /{slug} instead of using rkeys.
 *
 * Example:
 * - /blog → maps to Standard.site publication with rkey "3m3x4bgbsh22k"
 * - /notes → maps to Standard.site publication with rkey "xyz123abc"
 */

export type PublicationPlatform = 'standard.site';

export interface SlugMapping {
	/** The URL-friendly slug (will be normalized automatically) */
	slug: string;
	/** The publication rkey */
	publicationRkey: string;
	/** The platform this publication belongs to (always 'standard.site') */
	platform: PublicationPlatform;
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
		publicationRkey: '3m3x4bgbsh22k', // Your blog publication rkey
		platform: 'standard.site'
	},
	{
		slug: 'cailean',
		publicationRkey: '3m4222fxc3k2q', // Cailean Uen's journal publication rkey
		platform: 'standard.site'
	},
	{
		slug: 'creativity',
		publicationRkey: '3m6afhzlxt22p', // Your creativity dump publication rkey
		platform: 'standard.site'
	}
	// Add more mappings as needed:
	// { slug: 'notes', publicationRkey: 'xyz123abc', platform: 'standard.site' },
	// { slug: 'essays', publicationRkey: 'def456ghi', platform: 'standard.site' },
];
