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
  const profile = await fetchProfile(PUBLIC_ATPROTO_DID, fetch);

  return {
    profile,
    kibunStatus: fetchKibunStatus(PUBLIC_ATPROTO_DID, fetch).catch(() => null),
    musicStatus: fetchMusicStatus(PUBLIC_ATPROTO_DID, fetch).catch(() => null),
    posts: fetchBlogPosts(PUBLIC_ATPROTO_DID, fetch)
      .then((d) => d.posts)
      .catch(() => []),
    sifaProjects: fetchSifaProjects(PUBLIC_ATPROTO_DID, fetch).catch(() => []),
    publications: fetchPublications(PUBLIC_ATPROTO_DID, fetch)
      .then((d) => d.publications)
      .catch(() => []),
    links: fetchLinks(PUBLIC_ATPROTO_DID, fetch).catch(() => null),
  };
};
