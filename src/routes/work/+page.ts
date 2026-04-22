import type { PageLoad } from './$types';
import { createDynamicSiteMeta } from '$lib/helper/siteMeta';
import {
	fetchSifaProfile,
	fetchSifaSkills,
	fetchSifaProjects,
	fetchSifaLanguages,
	fetchSifaCertifications,
	fetchSifaExternalAccounts,
	fetchSifaPositions,
	fetchSifaEducation,
	fetchSifaVolunteering,
	fetchSifaHonors,
	fetchSifaCourses,
	fetchSifaPublications
} from '$lib/services/atproto';
import { fetchGitHubData, fetchContributions } from '$lib/services/github';

const GITHUB_USERNAME = 'ewanc26';

export const load: PageLoad = async ({ fetch }) => {
	const [
		profile,
		skills,
		projects,
		languages,
		certifications,
		externalAccounts,
		positions,
		education,
		volunteering,
		honors,
		courses,
		publications,
		githubData,
		contributions
	] = await Promise.all([
		fetchSifaProfile(fetch),
		fetchSifaSkills(fetch),
		fetchSifaProjects(fetch),
		fetchSifaLanguages(fetch),
		fetchSifaCertifications(fetch),
		fetchSifaExternalAccounts(fetch),
		fetchSifaPositions(fetch),
		fetchSifaEducation(fetch),
		fetchSifaVolunteering(fetch),
		fetchSifaHonors(fetch),
		fetchSifaCourses(fetch),
		fetchSifaPublications(fetch),
		fetchGitHubData(GITHUB_USERNAME, fetch),
		fetchContributions(GITHUB_USERNAME, fetch, 90)
	]);

	const meta = createDynamicSiteMeta({
		title: 'Work',
		description: profile?.headline || 'Professional profile, skills, and projects'
	});

	return {
		profile,
		skills,
		projects,
		languages,
		certifications,
		externalAccounts,
		positions,
		education,
		volunteering,
		honors,
		courses,
		publications,
		github: githubData,
		contributions,
		meta
	};
};
