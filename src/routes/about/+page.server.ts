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

export const load: PageServerLoad = async () => {
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
    fetchProfile(PUBLIC_ATPROTO_DID),
    fetchLinks(PUBLIC_ATPROTO_DID).catch(() => null),
    fetchSifaProfile(PUBLIC_ATPROTO_DID).catch(() => null),
    fetchSifaSkills(PUBLIC_ATPROTO_DID).catch(() => []),
    fetchSifaEducation(PUBLIC_ATPROTO_DID).catch(() => []),
    fetchSifaLanguages(PUBLIC_ATPROTO_DID).catch(() => []),
    fetchSifaExternalAccounts(PUBLIC_ATPROTO_DID).catch(() => []),
    fetchSifaProjects(PUBLIC_ATPROTO_DID).catch(() => []),
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
