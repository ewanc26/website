import type { PageServerLoad } from "./$types";
import {
  fetchKibunStatus,
  fetchBlogPosts,
  fetchPublications,
  fetchProfile,
  fetchMusicStatus,
  fetchSifaProjects,
  fetchLinks,
} from "@ewanc26/atproto";
import { PUBLIC_ATPROTO_DID } from "$env/static/public";

export const load: PageServerLoad = async ({ fetch }) => {
  const [
    profile,
    kibunStatus,
    musicStatus,
    postsData,
    sifaProjects,
    publicationsData,
    links,
  ] = await Promise.all([
    fetchProfile(PUBLIC_ATPROTO_DID, fetch),
    fetchKibunStatus(PUBLIC_ATPROTO_DID, fetch).catch(() => null),
    fetchMusicStatus(PUBLIC_ATPROTO_DID, fetch).catch(() => null),
    fetchBlogPosts(PUBLIC_ATPROTO_DID, fetch).catch(() => ({ posts: [] })),
    fetchSifaProjects(PUBLIC_ATPROTO_DID, fetch).catch(() => []),
    fetchPublications(PUBLIC_ATPROTO_DID, fetch).catch(() => ({
      publications: [],
    })),
    fetchLinks(PUBLIC_ATPROTO_DID, fetch).catch(() => ({ cards: [] })),
  ]);

  return {
    profile,
    kibunStatus,
    musicStatus,
    posts: (postsData?.posts ?? []).map((p: any) => ({
      title: p.title,
      createdAt: p.createdAt,
      publicationRkey: p.publicationRkey,
      rkey: p.rkey,
    })),
    sifaProjects,
    publications: publicationsData?.publications ?? [],
    links,
  };
};
