import type { PageServerLoad } from "./$types";
import { fetchDocuments, fetchPublications } from "$lib/services/atproto/fetch";
import { PUBLIC_LEAFLET_DOCS_PUBLICATION } from "$env/static/public";

export const load: PageServerLoad = async () => {
  const [{ documents }, { publications }] = await Promise.all([
    fetchDocuments(),
    fetchPublications(),
  ]);

  const docsPublication = publications.find(
    (p) => p.rkey === PUBLIC_LEAFLET_DOCS_PUBLICATION,
  );
  const projectDocs = documents
    .filter((d) => d.publicationRkey === PUBLIC_LEAFLET_DOCS_PUBLICATION)
    .map(({ title, description, path, publishedAt }) => ({
      title,
      description: description ?? "",
      path,
      publishedAt,
    }));

  return {
    publication: docsPublication
      ? {
          title: docsPublication.name,
          description: docsPublication.description ?? "",
          url: docsPublication.url,
        }
      : null,
    projects: projectDocs,
  };
};
