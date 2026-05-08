import type { PageLoad } from './$types';
import { createDynamicSiteMeta } from '$lib/helper/siteMeta';

export const load: PageLoad = () => {
	const meta = createDynamicSiteMeta({
		title: 'Support my work',
		description: 'Support my open-source work via Ko-fi, GitHub Sponsors, or cryptocurrency.'
	});

	return { meta };
};
