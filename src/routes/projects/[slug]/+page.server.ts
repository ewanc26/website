import type { PageServerLoad } from "./$types";
import { fetchDocuments } from "@ewanc26/atproto";
import { PUBLIC_ATPROTO_DID, PUBLIC_LEAFLET_DOCS_PUBLICATION } from "$env/static/public";
import { error } from "@sveltejs/kit";
import { renderMarkdown } from "$lib/markdown";

export const load: PageServerLoad = async ({ params, fetch }) => {
  const { slug } = params;
  const { documents } = await fetchDocuments(PUBLIC_ATPROTO_DID, fetch).catch(() => ({
    documents: [],
  }));

  const projectDoc = documents.find(
    (d) => d.publicationRkey === PUBLIC_LEAFLET_DOCS_PUBLICATION && d.path === slug
  );

  if (!projectDoc) {
    throw error(404, "Project not found");
  }

  const renderedContent = renderMarkdown(projectDoc.text ?? projectDoc.content ?? "");

  return {
    project: {
      title: projectDoc.title,
      publishedAt: projectDoc.publishedAt,
      content: renderedContent
    }
  };
};
