import type { PageServerLoad } from "./$types";
import { fetchDocuments, fetchPublications } from "@ewanc26/atproto";
import {
  PUBLIC_ATPROTO_DID,
  PUBLIC_LEAFLET_DOCS_PUBLICATION,
} from "$env/static/public";

export const load: PageServerLoad = async ({ fetch }) => {
  const [{ documents }, { publications }] = await Promise.all([
    fetchDocuments(PUBLIC_ATPROTO_DID, fetch).catch(() => ({ documents: [] })),
    fetchPublications(PUBLIC_ATPROTO_DID, fetch).catch(() => ({
      publications: [],
    })),
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
