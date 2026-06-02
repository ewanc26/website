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
import {
  PUBLIC_ATPROTO_DID,
  PUBLIC_LEAFLET_BLOG_PUBLICATION,
} from "$env/static/public";

export const load: PageServerLoad = async ({ fetch }) => {
  const [
    kibunStatus,
    { posts },
    { publications },
    profile,
    musicStatus,
    sifaProjects,
    links,
  ] = await Promise.all([
    fetchKibunStatus(PUBLIC_ATPROTO_DID, fetch).catch(() => null),
    fetchBlogPosts(PUBLIC_ATPROTO_DID, fetch).catch(() => ({ posts: [] })),
    fetchPublications(PUBLIC_ATPROTO_DID, fetch).catch(() => ({
      publications: [],
    })),
    fetchProfile(PUBLIC_ATPROTO_DID, fetch).catch(() => ({
      displayName: "",
      description: "",
      avatar: "",
      banner: "",
      did: PUBLIC_ATPROTO_DID,
    })),
    fetchMusicStatus(PUBLIC_ATPROTO_DID, fetch).catch(() => null),
    fetchSifaProjects(PUBLIC_ATPROTO_DID, fetch).catch(() => []),
    fetchLinks(PUBLIC_ATPROTO_DID, fetch).catch(() => null),
  ]);

  const blogPublication = publications.find(
    (p) => p.rkey === PUBLIC_LEAFLET_BLOG_PUBLICATION,
  );
  const publicationPosts = posts.filter(
    (p) => p.publicationRkey === PUBLIC_LEAFLET_BLOG_PUBLICATION,
  );

  const otherPublications = publications
    .filter((p) => p.rkey !== PUBLIC_LEAFLET_BLOG_PUBLICATION)
    .map(({ name, description, url }) => ({
      name,
      description: description ?? "",
      url,
    }));

  return {
    profile,
    kibunStatus,
    musicStatus,
    blog: blogPublication
      ? {
          title: blogPublication.name,
          description: blogPublication.description ?? "",
          url: blogPublication.url,
          rss: `${blogPublication.url}/rss`,
        }
      : null,
    posts: publicationPosts
      .slice(0, 5)
      .map(({ title, createdAt, publicationRkey, rkey, url }) => ({
        title,
        createdAt,
        publicationRkey,
        rkey,
        url,
      })),
    publications: otherPublications,
    projects: sifaProjects
      .sort(() => Math.random() - 0.5)
      .slice(0, 6)
      .map(({ name, description, url }) => ({
        name,
        description: description ?? "",
        url: url ?? "",
      })),
    links:
      links?.cards
        ?.slice(0, 8)
        .map(({ text, url, emoji }) => ({ text, url, emoji })) ?? [],
  };
};
