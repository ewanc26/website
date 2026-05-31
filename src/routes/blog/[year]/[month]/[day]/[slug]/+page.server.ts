import type { PageServerLoad } from "./$types";
import { fetchDocuments, fetchBlob } from "$lib/services/atproto/fetch";
import { PUBLIC_LEAFLET_BLOG_PUBLICATION } from "$env/static/public";
import { error } from "@sveltejs/kit";
import { normalizeSlug } from "$lib/utils/slugify";
import { renderMarkdown } from "$lib/utils/markdown";
import { leafletProvider } from "$lib/providers/leaflet";

export const load: PageServerLoad = async ({ params }) => {
  const { year, month, day, slug } = params;
  const { documents } = await fetchDocuments();

  const publicationDocs = documents.filter(
    (d) => d.publicationRkey === PUBLIC_LEAFLET_BLOG_PUBLICATION,
  );

  const post = publicationDocs.find((d) => {
    const date = new Date(d.publishedAt);
    const y = date.getFullYear().toString();
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const da = date.getDate().toString().padStart(2, "0");
    const docSlug = normalizeSlug(d.title);
    return y === year && m === month && da === day && docSlug === slug;
  });

  if (!post) {
    throw error(404, "Post not found");
  }

  let markdown = "";
  if (
    post.content &&
    typeof post.content === "object" &&
    leafletProvider.matches(post.content)
  ) {
    const result = await leafletProvider.toMarkdown(post.content, {
      fetchBlob,
    });
    markdown = result.markdown;
  } else {
    markdown =
      typeof post.content === "string" ? post.content : post.textContent || "";
  }

  const renderedContent = await renderMarkdown(markdown);

  return {
    post: {
      ...post,
      createdAt: post.publishedAt,
      renderedContent,
    },
  };
};
