import type { PageServerLoad } from "./$types";
import type { Config } from "@sveltejs/adapter-vercel";
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

export const config: Config = { maxDuration: 30 };

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
  setHeaders({
    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
  });

  // Pass the event fetch to all ATProto calls so they benefit from
  // SvelteKit's request context and avoid using the bare global fetch.
  const profilePromise = fetchProfile(PUBLIC_ATPROTO_DID, fetch).catch(() => ({
    displayName: "",
    description: "",
    avatar: "",
    banner: "",
    did: PUBLIC_ATPROTO_DID,
  }));

  const linksPromise = fetchLinks(PUBLIC_ATPROTO_DID, fetch).catch(
    () => null,
  );
  const sifaProfilePromise = fetchSifaProfile(PUBLIC_ATPROTO_DID, fetch).catch(
    () => null,
  );
  const sifaSkillsPromise = fetchSifaSkills(PUBLIC_ATPROTO_DID, fetch).catch(
    () => [],
  );
  const sifaEducationPromise = fetchSifaEducation(
    PUBLIC_ATPROTO_DID,
    fetch,
  ).catch(() => []);
  const sifaLanguagesPromise = fetchSifaLanguages(
    PUBLIC_ATPROTO_DID,
    fetch,
  ).catch(() => []);
  const sifaExternalAccountsPromise = fetchSifaExternalAccounts(
    PUBLIC_ATPROTO_DID,
    fetch,
  ).catch(() => []);
  const sifaProjectsPromise = fetchSifaProjects(
    PUBLIC_ATPROTO_DID,
    fetch,
  ).catch(() => []);

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
