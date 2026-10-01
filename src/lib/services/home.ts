/**
 * Homepage data. Fetched at render time so the page ships complete HTML
 * (it used to hydrate from /api/home after load).
 */

import {
  fetchProfile,
  fetchKibunStatus,
  fetchBlogPosts,
  fetchPublications,
  fetchMusicStatus,
  fetchLinks,
} from "@ewanc26/atproto";
import { PUBLIC_ATPROTO_DID } from "$env/static/public";
import { env } from "$env/dynamic/private";
import {
  fetchPinnedGitHubProjects,
  fetchGitHubContributions,
  fetchGitHubCommitTotal,
  fetchGitHubLanguages,
} from "$lib/services/github";
import languageSnapshot from "$lib/data/github-languages.json";

const CONSTELLATION =
  "https://constellation.microcosm.blue/xrpc/blue.microcosm.links.getBacklinks";

async function fetchVerifications() {
  try {
    const url = `${CONSTELLATION}?subject=${encodeURIComponent(PUBLIC_ATPROTO_DID)}&source=app.bsky.graph.verification:subject`;
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return [];
    const data = await response.json();
    if (!Array.isArray(data?.records)) return [];
    return await Promise.all(
      data.records.map(async (record: { did: string }) => {
        const v = await fetchProfile(record.did, fetch);
        return {
          did: record.did,
          name: v.displayName || v.handle,
          avatarUrl: v.avatar,
          handle: v.handle,
          date: "",
        };
      }),
    );
  } catch (e) {
    console.error("Failed to fetch verifications:", e);
    return [];
  }
}

type LanguageSnapshot = typeof languageSnapshot;

async function loadSnapshot(username: string) {
  const token = env.GITHUB_TOKEN;
  const bundled = languageSnapshot as LanguageSnapshot;
  const hasBundled =
    bundled.username?.toLowerCase() === username.toLowerCase() &&
    bundled.languages.length > 0;
  const [languages, commits] = await Promise.all([
    hasBundled
      ? Promise.resolve(bundled.languages)
      : fetchGitHubLanguages(username, fetch, token).catch(() => []),
    token
      ? fetchGitHubCommitTotal(username, fetch, token).catch(() => null)
      : Promise.resolve(null),
  ]);
  return { languages, commits };
}

export async function getHomeData() {
  const githubUsername = env.GITHUB_USERNAME || "ewanc26";
  const [
    profile,
    verifications,
    kibunStatus,
    musicStatus,
    postsData,
    githubProjects,
    githubContributions,
    githubSnapshot,
    publicationsData,
    links,
  ] = await Promise.all([
    fetchProfile(PUBLIC_ATPROTO_DID, fetch).catch(
      () =>
        ({
          displayName: "Ewan Croft",
          handle: "ewancroft.uk",
          description: "",
        }) as Awaited<ReturnType<typeof fetchProfile>>,
    ),
    fetchVerifications(),
    fetchKibunStatus(PUBLIC_ATPROTO_DID, fetch).catch(() => null),
    fetchMusicStatus(PUBLIC_ATPROTO_DID, fetch).catch(() => null),
    fetchBlogPosts(PUBLIC_ATPROTO_DID, fetch).catch(() => ({ posts: [] })),
    fetchPinnedGitHubProjects(githubUsername, fetch, env.GITHUB_TOKEN).catch(
      () => [],
    ),
    fetchGitHubContributions(githubUsername, fetch, env.GITHUB_TOKEN).catch(
      () => null,
    ),
    loadSnapshot(githubUsername),
    fetchPublications(PUBLIC_ATPROTO_DID, fetch).catch(() => ({
      publications: [],
    })),
    fetchLinks(PUBLIC_ATPROTO_DID, fetch).catch(() => ({ cards: [] })),
  ]);

  return {
    profile,
    verifications,
    kibunStatus,
    musicStatus,
    posts: (postsData?.posts ?? []) as any[],
    githubProjects: githubProjects as any[],
    githubUsername,
    githubContributions,
    githubLanguages: githubSnapshot.languages,
    githubCommits: githubSnapshot.commits,
    publications: (publicationsData?.publications ?? []) as any[],
    links: (links ?? { cards: [] }) as { cards: any[] },
  };
}
