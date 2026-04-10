import type { PageLoad } from './$types';
import { createDynamicSiteMeta } from '$lib/helper/siteMeta';
import { fetchGitHubData, fetchContributions } from '$lib/services/github';

const GITHUB_USERNAME = 'ewanc26';

export const load: PageLoad = async ({ fetch }) => {
	const [profileData, contributions] = await Promise.all([
		fetchGitHubData(GITHUB_USERNAME, fetch),
		fetchContributions(GITHUB_USERNAME, fetch, 90)
	]);

	// Create page metadata with dynamic OG
	const meta = createDynamicSiteMeta({
		title: 'GitHub',
		description: `Ewan's GitHub profile and contributions`
	});

	return { ...profileData, contributions, meta };
};
