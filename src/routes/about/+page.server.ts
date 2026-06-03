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
  const profilePromise = fetchProfile(PUBLIC_ATPROTO_DID).catch(() => ({
    displayName: "",
    description: "",
    avatar: "",
    banner: "",
    did: PUBLIC_ATPROTO_DID,
  }));

  const linksPromise = fetchLinks(PUBLIC_ATPROTO_DID).catch(() => null);
  const sifaProfilePromise = fetchSifaProfile(PUBLIC_ATPROTO_DID).catch(
    () => null,
  );
  const sifaSkillsPromise = fetchSifaSkills(PUBLIC_ATPROTO_DID).catch(() => []);
  const sifaEducationPromise = fetchSifaEducation(PUBLIC_ATPROTO_DID).catch(
    () => [],
  );
  const sifaLanguagesPromise = fetchSifaLanguages(PUBLIC_ATPROTO_DID).catch(
    () => [],
  );
  const sifaExternalAccountsPromise = fetchSifaExternalAccounts(
    PUBLIC_ATPROTO_DID,
  ).catch(() => []);
  const sifaProjectsPromise = fetchSifaProjects(PUBLIC_ATPROTO_DID).catch(
    () => [],
  );

  const profile = await profilePromise;

  return {
    profile,
    lazy: {
      links: linksPromise,
      sifaProfile: sifaProfilePromise,
      sifaSkills: sifaSkillsPromise,
      sifaEducation: sifaEducationPromise,
      sifaLanguages: sifaLanguagesPromise,
      sifaExternalAccounts: sifaExternalAccountsPromise,
      sifaProjects: sifaProjectsPromise,
    },
  };
};
