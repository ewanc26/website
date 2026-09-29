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
import { fetchPinnedGitHubProjects } from "$lib/services/github";

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

export async function getHomeData() {
  const githubUsername = env.GITHUB_USERNAME || "ewanc26";
  const [
    profile,
    verifications,
    kibunStatus,
    musicStatus,
    postsData,
    githubProjects,
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
    publications: (publicationsData?.publications ?? []) as any[],
    links: (links ?? { cards: [] }) as { cards: any[] },
  };
}
