import { normalizeSlug, isTidFormat } from '@ewanc26/utils';
import { slugMappings, type SlugMapping, type PublicationPlatform } from '$lib/data/slug-mappings';

export { normalizeSlug, isTidFormat };

export function getPublicationFromSlug(
	slug: string
): { rkey: string; platform: PublicationPlatform } | null {
	const normalizedSlug = normalizeSlug(slug);
	const mapping = slugMappings.find((m) => normalizeSlug(m.slug) === normalizedSlug);
	if (!mapping) return null;
	return { rkey: mapping.publicationRkey, platform: mapping.platform };
}

export function getPublicationRkeyFromSlug(slug: string): string | null {
	return getPublicationFromSlug(slug)?.rkey || null;
}

export function getSlugFromPublicationRkey(rkey: string): string | null {
	return slugMappings.find((m) => m.publicationRkey === rkey)?.slug || null;
}

export function getAllSlugs(): string[] {
	return slugMappings.map((m) => normalizeSlug(m.slug));
}

export function getAllSlugMappings(): SlugMapping[] {
	return slugMappings.map((m) => ({ ...m, slug: normalizeSlug(m.slug) }));
}

export function getAllPublicationRkeys(): string[] {
	return slugMappings.map((m) => m.publicationRkey);
}
