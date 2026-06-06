import type { PageServerLoad } from "./$types";
import type { Config } from "@sveltejs/adapter-vercel";
import { fetchDocuments } from "@ewanc26/atproto";
import {
  PUBLIC_ATPROTO_DID,
  PUBLIC_LEAFLET_DOCS_PUBLICATION,
} from "$env/static/public";
import { error } from "@sveltejs/kit";
import { renderMarkdown } from "$lib/markdown";

export const config: Config = { maxDuration: 60 };

export const load: PageServerLoad = async ({ params, fetch, setHeaders }) => {
  setHeaders({
    "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
  });
  const { slug } = params;
  const { documents } = await fetchDocuments(PUBLIC_ATPROTO_DID, fetch).catch(
    () => ({
      documents: [],
    }),
  );

  const projectDoc = documents.find(
    (d) =>
      d.publicationRkey === PUBLIC_LEAFLET_DOCS_PUBLICATION && d.path === slug,
  );

  if (!projectDoc) {
    throw error(404, "Project not found");
  }

  const renderedContent = renderMarkdown(
    (projectDoc as any).text ?? projectDoc.content ?? "",
  );

  return {
    project: {
      title: projectDoc.title,
      publishedAt: projectDoc.publishedAt,
      content: renderedContent,
    },
  };
};
