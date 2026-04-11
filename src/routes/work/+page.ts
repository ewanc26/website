import type { PageLoad } from './$types';
import { createDynamicSiteMeta } from '$lib/helper/siteMeta';
import {
	fetchSifaProfile,
	fetchSifaSkills,
	fetchSifaProjects,
	fetchSifaLanguages,
	fetchSifaCertifications,
	fetchSifaExternalAccounts
} from '$lib/services/atproto';

export const load: PageLoad = async ({ fetch }) => {
	const [profile, skills, projects, languages, certifications, externalAccounts] = await Promise.all([
		fetchSifaProfile(fetch),
		fetchSifaSkills(fetch),
		fetchSifaProjects(fetch),
		fetchSifaLanguages(fetch),
		fetchSifaCertifications(fetch),
		fetchSifaExternalAccounts(fetch)
	]);

	const meta = createDynamicSiteMeta({
		title: 'Work',
		description: profile?.headline || 'Professional profile, skills, and projects'
	});

	return { profile, skills, projects, languages, certifications, externalAccounts, meta };
};
