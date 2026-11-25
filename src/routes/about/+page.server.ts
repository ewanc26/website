import { fetchSifaProfile, fetchSifaSkills, fetchSifaEducation, fetchSifaLanguages, fetchSifaExternalAccounts } from "@ewanc26/atproto";
import { PUBLIC_ATPROTO_DID } from "$app/env/public";
import { GITHUB_TOKEN, GITHUB_USERNAME } from "$app/env/private";
import { fetchPinnedGitHubProjects } from "$lib/services/github";
import { resolveDid } from "$lib/services/atproto/did";
import { fetchProfile, fetchProfileLinks } from "$lib/services/atproto/fetch";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
  setHeaders({ "cache-control": "public, s-maxage=300, stale-while-revalidate=3600" });

  const did = PUBLIC_ATPROTO_DID;
  const [profile, links, sifa, skills, education, languages, professional, projects, pds] = await Promise.all([
    fetchProfile(did, fetch).catch(() => ({ displayName: "", description: "", avatar: "", handle: "", did, pronouns: "" }) as any),
    fetchProfileLinks(fetch).catch(() => null),
    fetchSifaProfile(did, fetch).catch(() => null),
    fetchSifaSkills(did, fetch).catch(() => []),
    fetchSifaEducation(did, fetch).catch(() => []),
    fetchSifaLanguages(did, fetch).catch(() => []),
    fetchSifaExternalAccounts(did, fetch).catch(() => []),
    fetchPinnedGitHubProjects(GITHUB_USERNAME || "ewanc26", fetch, GITHUB_TOKEN).catch(() => []),
    resolveDid(did, fetch)
      .then((doc) => {
        const e = doc?.service?.[0]?.serviceEndpoint;
        return typeof e === "string" ? new URL(e).hostname : null;
      })
      .catch(() => null),
  ]);

  return { profile, links, sifa, skills, education, languages, professional, projects, pds };
};
