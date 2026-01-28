import type { ParamMatcher } from '@sveltejs/kit';
import { getAllSlugs } from '$lib/config/slugs';

/**
 * Param matcher for valid slugs or publication rkeys
 * Allows:
 * - Slugs defined in the slug-mappings configuration
 * - Publication rkeys (TID format: 12-16 alphanumeric characters)
 */
export const match: ParamMatcher = (param) => {
	// Check if it's a configured slug
	const validSlugs = getAllSlugs();
	if (validSlugs.includes(param)) {
		return true;
	}
	
	// Check if it's a valid TID format (AT Protocol record key)
	const tidPattern = /^[a-zA-Z0-9]{12,16}$/;
	return tidPattern.test(param);
};
