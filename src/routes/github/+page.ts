import type { PageLoad } from './$types';
import { fetchGitHubData } from '$lib/services/github';

const GITHUB_USERNAME = 'ewanc26';

export const load: PageLoad = async ({ fetch }) => {
	const { profile, repos } = await fetchGitHubData(GITHUB_USERNAME, fetch);
	return { profile, repos };
};
