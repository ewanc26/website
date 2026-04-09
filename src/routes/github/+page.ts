import type { PageLoad } from './$types';
import { fetchGitHubData, fetchContributions } from '$lib/services/github';

const GITHUB_USERNAME = 'ewanc26';

export const load: PageLoad = async ({ fetch }) => {
	const [profileData, contributions] = await Promise.all([
		fetchGitHubData(GITHUB_USERNAME, fetch),
		fetchContributions(GITHUB_USERNAME, fetch, 90)
	]);
	return { ...profileData, contributions };
};
