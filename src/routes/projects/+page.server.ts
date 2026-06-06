import type { PageServerLoad } from "./$types";
import type { Config } from "@sveltejs/adapter-vercel";
import { fetchDocuments, fetchPublications } from "@ewanc26/atproto";
import {
  PUBLIC_ATPROTO_DID,
  PUBLIC_LEAFLET_DOCS_PUBLICATION,
} from "$env/static/public";

const PAGE_SIZE = 20;

export const config: Config = { maxDuration: 30 };

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
  setHeaders({
    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
  });
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
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );

  const allProjectsFlat = projectDocs.map(
    ({ title, description, path, publishedAt }) => ({
      title,
      description: description ?? "",
      path,
      publishedAt,
    }),
  );

  const initial = allProjectsFlat.slice(0, PAGE_SIZE);
  const remaining = allProjectsFlat.length - PAGE_SIZE;

  return {
    publication: docsPublication
      ? {
          title: docsPublication.name,
          description: docsPublication.description ?? "",
          url: docsPublication.url,
        }
      : null,
    projects: initial,
    total: allProjectsFlat.length,
    hasMore: remaining > 0,
    pageSize: PAGE_SIZE,
  };
};
