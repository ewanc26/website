import type { PageServerLoad } from "./$types";
import {
  fetchKibunStatus,
  fetchBlogPosts,
  fetchPublications,
} from "$lib/services/atproto/fetch";
import { PUBLIC_LEAFLET_BLOG_PUBLICATION } from "$env/static/public";

export const load: PageServerLoad = async () => {
  const [kibunStatus, { posts }, { publications }] = await Promise.all([
    fetchKibunStatus(),
    fetchBlogPosts(),
    fetchPublications(),
  ]);

  const blogPublication = publications.find(
    (p) => p.rkey === PUBLIC_LEAFLET_BLOG_PUBLICATION,
  );
  const publicationPosts = posts.filter(
    (p) => p.publicationRkey === PUBLIC_LEAFLET_BLOG_PUBLICATION,
  );

  // Other publications (excluding blog — it's already shown above)
  const otherPublications = publications
    .filter((p) => p.rkey !== PUBLIC_LEAFLET_BLOG_PUBLICATION)
    .map(({ name, description, url }) => ({
      name,
      description: description ?? "",
      url,
    }));

  return {
    kibunStatus,
    blog: blogPublication
      ? {
          title: blogPublication.name,
          description: blogPublication.description ?? "",
          url: blogPublication.url,
          rss: `${blogPublication.url}/rss`,
        }
      : null,
    // Recent posts only — full listing lives at /blog
    posts: publicationPosts
      .slice(0, 5)
      .map(({ title, createdAt, publicationRkey, rkey, uri }) => ({
        title,
        createdAt,
        publicationRkey,
        rkey,
        uri,
      })),
    publications: otherPublications,
  };
};
