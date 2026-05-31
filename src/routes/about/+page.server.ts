import type { PageServerLoad } from "./$types";
import {
  fetchProfile,
  fetchLinks,
  fetchSifaProfile,
  fetchSifaSkills,
  fetchSifaEducation,
  fetchSifaLanguages,
  fetchSifaExternalAccounts,
  fetchSifaProjects,
} from "@ewanc26/atproto";
import { PUBLIC_ATPROTO_DID } from "$env/static/public";

export const load: PageServerLoad = async ({ fetch }) => {
  const [
    profile,
    links,
    sifaProfile,
    sifaSkills,
    sifaEducation,
    sifaLanguages,
    sifaExternalAccounts,
    sifaProjects,
  ] = await Promise.all([
    fetchProfile(PUBLIC_ATPROTO_DID, fetch),
    fetchLinks(PUBLIC_ATPROTO_DID, fetch).catch(() => null),
    fetchSifaProfile(PUBLIC_ATPROTO_DID, fetch).catch(() => null),
    fetchSifaSkills(PUBLIC_ATPROTO_DID, fetch).catch(() => []),
    fetchSifaEducation(PUBLIC_ATPROTO_DID, fetch).catch(() => []),
    fetchSifaLanguages(PUBLIC_ATPROTO_DID, fetch).catch(() => []),
    fetchSifaExternalAccounts(PUBLIC_ATPROTO_DID, fetch).catch(() => []),
    fetchSifaProjects(PUBLIC_ATPROTO_DID, fetch).catch(() => []),
  ]);

  return {
    profile,
    links,
    sifaProfile,
    sifaSkills,
    sifaEducation,
    sifaLanguages,
    sifaExternalAccounts,
    sifaProjects,
  };
};
