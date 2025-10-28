import type { ParamMatcher } from '@sveltejs/kit';
import { getAllSlugs } from '$lib/config/slugs';

/**
 * Param matcher for valid slugs
 * Only allows slugs that are defined in the slug-mappings configuration
 */
export const match: ParamMatcher = (param) => {
	const validSlugs = getAllSlugs();
	return validSlugs.includes(param);
};
