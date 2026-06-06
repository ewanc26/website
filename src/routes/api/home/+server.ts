import { json } from "@sveltejs/kit";
import {
  fetchKibunStatus,
  fetchBlogPosts,
  fetchPublications,
  fetchMusicStatus,
  fetchSifaProjects,
  fetchLinks,
} from "@ewanc26/atproto";
import { PUBLIC_ATPROTO_DID } from "$env/static/public";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ fetch }) => {
  const [
    kibunStatus,
    musicStatus,
    postsData,
    sifaProjects,
    publicationsData,
    links,
  ] = await Promise.all([
    fetchKibunStatus(PUBLIC_ATPROTO_DID, fetch).catch(() => null),
    fetchMusicStatus(PUBLIC_ATPROTO_DID, fetch).catch(() => null),
    fetchBlogPosts(PUBLIC_ATPROTO_DID, fetch).catch(() => ({ posts: [] })),
    fetchSifaProjects(PUBLIC_ATPROTO_DID, fetch).catch(() => []),
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
    sifaProjects,
    publications: publicationsData?.publications ?? [],
    links,
  });
};
