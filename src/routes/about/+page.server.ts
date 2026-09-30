import { fetchProfile, fetchLinks, fetchSifaProfile, fetchSifaSkills, fetchSifaEducation, fetchSifaLanguages, fetchSifaExternalAccounts } from "@ewanc26/atproto";
import { PUBLIC_ATPROTO_DID } from "$env/static/public";
import { env } from "$env/dynamic/private";
import { fetchPinnedGitHubProjects } from "$lib/services/github";
import { resolveDid } from "$lib/services/atproto/did";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
  setHeaders({ "cache-control": "public, s-maxage=300, stale-while-revalidate=3600" });

  const did = PUBLIC_ATPROTO_DID;
  const [profile, links, sifa, skills, education, languages, professional, projects, pds] = await Promise.all([
    fetchProfile(did, fetch).catch(() => ({ displayName: "", description: "", avatar: "", handle: "", did, pronouns: "" }) as any),
    fetchLinks(did, fetch).catch(() => null),
    fetchSifaProfile(did, fetch).catch(() => null),
    fetchSifaSkills(did, fetch).catch(() => []),
    fetchSifaEducation(did, fetch).catch(() => []),
    fetchSifaLanguages(did, fetch).catch(() => []),
    fetchSifaExternalAccounts(did, fetch).catch(() => []),
    fetchPinnedGitHubProjects(env.GITHUB_USERNAME || "ewanc26", fetch, env.GITHUB_TOKEN).catch(() => []),
    resolveDid(did, fetch)
      .then((doc) => {
        const e = doc?.service?.[0]?.serviceEndpoint;
        return typeof e === "string" ? new URL(e).hostname : null;
      })
      .catch(() => null),
  ]);

  return { profile, links, sifa, skills, education, languages, professional, projects, pds };
};
