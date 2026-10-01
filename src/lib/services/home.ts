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

const LANGUAGE_SNAPSHOT_URL =
  "https://raw.githubusercontent.com/ewanc26/website/data/github-languages.json";

type LanguageSnapshot = typeof languageSnapshot & { commits?: number | null };

const usable = (snap: LanguageSnapshot | null | undefined, username: string) =>
  !!snap &&
  snap.username?.toLowerCase() === username.toLowerCase() &&
  Array.isArray(snap.languages) &&
  snap.languages.length > 0;

async function loadSnapshot(username: string) {
  try {
    const res = await fetch(LANGUAGE_SNAPSHOT_URL);
    if (res.ok) {
      const remote = (await res.json()) as LanguageSnapshot;
      if (usable(remote, username)) {
        return { languages: remote.languages, commits: remote.commits ?? null };
      }
    }
  } catch {}
  const bundled = languageSnapshot as LanguageSnapshot;
  if (usable(bundled, username)) {
    return { languages: bundled.languages, commits: bundled.commits ?? null };
  }
  const languages = await fetchGitHubLanguages(
    username,
    fetch,
    env.GITHUB_TOKEN,
  ).catch(() => []);
  return { languages, commits: null };
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
