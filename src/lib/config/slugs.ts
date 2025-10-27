import { slugMappings, type SlugMapping } from '$lib/data/slug-mappings';

/**
 * Normalize a slug to be URI-compatible
 * 
 * Transformations:
 * - Convert to lowercase
 * - Replace spaces with hyphens
 * - Remove all characters except alphanumeric, hyphens, and underscores
 * - Collapse multiple hyphens into single hyphen
 * - Remove leading/trailing hyphens
 * 
 * @param slug - The slug to normalize
 * @returns URI-compatible slug
 * 
 * @example
 * normalizeSlug('My Blog Post!') // 'my-blog-post'
 * normalizeSlug('Hello  World') // 'hello-world'
 * normalizeSlug('Test---Slug___') // 'test-slug'
 */
export function normalizeSlug(slug: string): string {
	return slug
		.toLowerCase()
		.trim()
		.replace(/\s+/g, '-') // Replace spaces with hyphens
		.replace(/[^a-z0-9\-_]/g, '') // Remove non-alphanumeric except hyphens and underscores
		.replace(/-+/g, '-') // Collapse multiple hyphens
		.replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Get publication rkey from slug
 * Automatically normalizes the slug before lookup
 * 
 * @param slug - The slug to look up (will be normalized)
 * @returns The publication rkey or null if not found
 */
export function getPublicationRkeyFromSlug(slug: string): string | null {
	const normalizedSlug = normalizeSlug(slug);
	const mapping = slugMappings.find(m => normalizeSlug(m.slug) === normalizedSlug);
	return mapping?.publicationRkey || null;
}

/**
 * Get slug from publication rkey
 * 
 * @param rkey - The publication rkey
 * @returns The slug or null if not found
 */
export function getSlugFromPublicationRkey(rkey: string): string | null {
	const mapping = slugMappings.find(m => m.publicationRkey === rkey);
	return mapping?.slug || null;
}

/**
 * Get all configured slugs (normalized)
 * 
 * @returns Array of normalized slugs
 */
export function getAllSlugs(): string[] {
	return slugMappings.map(m => normalizeSlug(m.slug));
}

/**
 * Get all slug mappings with normalized slugs
 * 
 * @returns Array of slug mappings with normalized slugs
 */
export function getAllSlugMappings(): SlugMapping[] {
	return slugMappings.map(m => ({
		...m,
		slug: normalizeSlug(m.slug)
	}));
}
