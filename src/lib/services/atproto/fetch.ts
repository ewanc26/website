// Thin wrappers over @ewanc26/atproto that bind PUBLIC_ATPROTO_DID so callers
// don't need to pass it explicitly — matching the original app API exactly.
import { PUBLIC_ATPROTO_DID } from '$env/static/public';
import {
	fetchProfile as _fetchProfile,
	fetchSiteInfo as _fetchSiteInfo,
	fetchLinks as _fetchLinks,
	fetchMusicStatus as _fetchMusicStatus,
	fetchKibunStatus as _fetchKibunStatus,
	fetchRecentPopfeedReviews as _fetchRecentPopfeedReviews,
	fetchSifaProfile as _fetchSifaProfile,
	fetchSifaSkills as _fetchSifaSkills,
	fetchSifaProjects as _fetchSifaProjects,
	fetchSifaLanguages as _fetchSifaLanguages,
	fetchSifaCertifications as _fetchSifaCertifications,
	fetchSifaExternalAccounts as _fetchSifaExternalAccounts,
	fetchSifaPositions as _fetchSifaPositions,
	fetchSifaEducation as _fetchSifaEducation,
	fetchSifaVolunteering as _fetchSifaVolunteering,
	fetchSifaHonors as _fetchSifaHonors,
	fetchSifaCourses as _fetchSifaCourses,
	fetchSifaPublications as _fetchSifaPublications
} from '@ewanc26/atproto';

export async function fetchProfile(fetchFn?: typeof fetch) {
	return _fetchProfile(PUBLIC_ATPROTO_DID, fetchFn);
}

export async function fetchSiteInfo(fetchFn?: typeof fetch) {
	return _fetchSiteInfo(PUBLIC_ATPROTO_DID, fetchFn);
}

export async function fetchLinks(fetchFn?: typeof fetch) {
	return _fetchLinks(PUBLIC_ATPROTO_DID, fetchFn);
}

export async function fetchMusicStatus(fetchFn?: typeof fetch) {
	return _fetchMusicStatus(PUBLIC_ATPROTO_DID, fetchFn);
}

export async function fetchKibunStatus(fetchFn?: typeof fetch) {
	return _fetchKibunStatus(PUBLIC_ATPROTO_DID, fetchFn);
}

export async function fetchRecentPopfeedReviews(fetchFn?: typeof fetch) {
	return _fetchRecentPopfeedReviews(PUBLIC_ATPROTO_DID, 5, fetchFn);
}

export async function fetchSifaProfile(fetchFn?: typeof fetch) {
	return _fetchSifaProfile(PUBLIC_ATPROTO_DID, fetchFn);
}

export async function fetchSifaSkills(fetchFn?: typeof fetch) {
	return _fetchSifaSkills(PUBLIC_ATPROTO_DID, fetchFn);
}

export async function fetchSifaProjects(fetchFn?: typeof fetch) {
	return _fetchSifaProjects(PUBLIC_ATPROTO_DID, fetchFn);
}

export async function fetchSifaLanguages(fetchFn?: typeof fetch) {
	return _fetchSifaLanguages(PUBLIC_ATPROTO_DID, fetchFn);
}

export async function fetchSifaCertifications(fetchFn?: typeof fetch) {
	return _fetchSifaCertifications(PUBLIC_ATPROTO_DID, fetchFn);
}

export async function fetchSifaExternalAccounts(fetchFn?: typeof fetch) {
	return _fetchSifaExternalAccounts(PUBLIC_ATPROTO_DID, fetchFn);
}

export async function fetchSifaPositions(fetchFn?: typeof fetch) {
	return _fetchSifaPositions(PUBLIC_ATPROTO_DID, fetchFn);
}

export async function fetchSifaEducation(fetchFn?: typeof fetch) {
	return _fetchSifaEducation(PUBLIC_ATPROTO_DID, fetchFn);
}

export async function fetchSifaVolunteering(fetchFn?: typeof fetch) {
	return _fetchSifaVolunteering(PUBLIC_ATPROTO_DID, fetchFn);
}

export async function fetchSifaHonors(fetchFn?: typeof fetch) {
	return _fetchSifaHonors(PUBLIC_ATPROTO_DID, fetchFn);
}

export async function fetchSifaCourses(fetchFn?: typeof fetch) {
	return _fetchSifaCourses(PUBLIC_ATPROTO_DID, fetchFn);
}

export async function fetchSifaPublications(fetchFn?: typeof fetch) {
	return _fetchSifaPublications(PUBLIC_ATPROTO_DID, fetchFn);
}
