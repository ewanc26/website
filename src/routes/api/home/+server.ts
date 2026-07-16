import { json } from "@sveltejs/kit";
import {
  fetchKibunStatus,
  fetchBlogPosts,
  fetchPublications,
  fetchMusicStatus,
  fetchLinks,
} from "@ewanc26/atproto";
import { PUBLIC_ATPROTO_DID } from "$env/static/public";
import { env } from "$env/dynamic/private";
import { fetchPinnedGitHubProjects } from "$lib/services/github";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ fetch }) => {
  const githubUsername = env.GITHUB_USERNAME || "ewanc26";
  const [
    kibunStatus,
    musicStatus,
    postsData,
    githubProjects,
    publicationsData,
    links,
  ] = await Promise.all([
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

  return json({
    kibunStatus,
    musicStatus,
    posts: (postsData?.posts ?? []).map((p: any) => ({
      title: p.title,
      createdAt: p.createdAt,
      publicationRkey: p.publicationRkey,
      rkey: p.rkey,
    })),
    githubProjects,
    githubUsername,
    publications: publicationsData?.publications ?? [],
    links,
  });
};
