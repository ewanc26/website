import type { PageServerLoad } from "./$types";
import { fetchDocuments, fetchPublications } from "@ewanc26/atproto";
import { fetchBlob, fetchComments } from "$lib/services/atproto/fetch";
import {
  PUBLIC_ATPROTO_DID,
  PUBLIC_LEAFLET_BLOG_PUBLICATION,
} from "$env/static/public";
import { error } from "@sveltejs/kit";
import { normalizeSlug } from "$lib/utils/slugify";
import { renderMarkdown } from "$lib/utils/markdown";
import { leafletProvider } from "$lib/providers/leaflet";
import {
  serialiseBlocks,
  type SerialisedBlock,
} from "$lib/providers/serialise";

export const load: PageServerLoad = async ({ params, fetch }) => {
  const { year, month, day, slug } = params;
  const [{ documents }, { publications }] = await Promise.all([
    fetchDocuments(PUBLIC_ATPROTO_DID, fetch).catch(() => ({ documents: [] })),
    fetchPublications(PUBLIC_ATPROTO_DID, fetch).catch(() => ({
      publications: [],
    })),
  ]);

  const blogPublication = publications.find(
    (p) => p.rkey === PUBLIC_LEAFLET_BLOG_PUBLICATION,
  );

  const publicationDocs = documents.filter(
    (d) => d.publicationRkey === PUBLIC_LEAFLET_BLOG_PUBLICATION,
  );

  const post = publicationDocs.find((d) => {
    const date = new Date(d.publishedAt);
    const y = date.getFullYear().toString();
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const dStr = date.getDate().toString().padStart(2, "0");
    const docSlug = normalizeSlug(d.title);
    return y === year && m === month && dStr === day && docSlug === slug;
  });

  if (!post) {
    throw error(404, "Post not found");
  }

  // Generate a clean text excerpt string by removing common markdown markup indicators
  const cleanExcerpt = (text: string) => {
    return text
      .replace(/[#*`_~\[\]()\-]/g, "") // Strip structural formatting tokens
      .replace(/\s+/g, " ")            // Normalize duplicate spaces and line breaks
      .trim();
  };

  // Build the strict fallback chain for description strings
  let metaDescription = post.description ?? "";
  if (!metaDescription && post.textContent) {
    const excerpt = cleanExcerpt(post.textContent);
    metaDescription = excerpt.length > 155 ? excerpt.slice(0, 152) + "..." : excerpt;
  }
  if (!metaDescription) {
    metaDescription = `Read ${post.title} on the blog.`;
  }

  let blocks: SerialisedBlock[] = [];
  let renderedContent = "";

  if (
    post.content &&
    typeof post.content === "object" &&
    leafletProvider.matches(post.content)
  ) {
    blocks = await serialiseBlocks(post.content, PUBLIC_ATPROTO_DID, fetchBlob);
    const result = await leafletProvider.toMarkdown(post.content, {
      fetchBlob,
    });
    renderedContent = await renderMarkdown(result.markdown);
  } else {
    const markdown =
      typeof post.content === "string" ? post.content : post.textContent || "";
    renderedContent = await renderMarkdown(markdown);
  }

  const comments = await fetchComments(post.uri, fetch);
  const { content: _content, ...serialisable } = post;

  return {
    post: {
      ...serialisable,
      createdAt: post.publishedAt,
      renderedContent,
      metaDescription,
      blocks,
    },
    blog: blogPublication
      ? {
          title: blogPublication.name,
          description: blogPublication.description ?? "",
          url: blogPublication.url,
          rss: `${blogPublication.url}/rss`,
        }
      : null,
    comments,
  };
};
