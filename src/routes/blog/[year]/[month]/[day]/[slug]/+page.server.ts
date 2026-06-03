import type { PageServerLoad } from "./$types";
import { fetchDocuments, fetchPublications } from "@ewanc26/atproto";
import { fetchBlob, fetchComments } from "$lib/services/atproto";
import {
  PUBLIC_ATPROTO_DID,
  PUBLIC_LEAFLET_BLOG_PUBLICATION,
} from "$env/static/public";
import { error } from "@sveltejs/kit";
import { normalizeSlug } from "$lib/utils/slugify";
import { renderMarkdown } from "$lib/utils/markdown";
import {
  leafletProvider,
  serialiseBlocks,
  type SerialisedBlock,
} from "$lib/providers";

export const load: PageServerLoad = async ({ params, fetch }) => {
  const { year, month, day, slug } = params;
  const [{ documents }, { publications }] = await Promise.all([
    fetchDocuments(PUBLIC_ATPROTO_DID, fetch),
    fetchPublications(PUBLIC_ATPROTO_DID, fetch),
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
    const da = date.getDate().toString().padStart(2, "0");
    const docSlug = normalizeSlug(d.title);
    return y === year && m === month && da === day && docSlug === slug;
  });

  if (!post) {
    throw error(404, "Post not found");
  }
  console.log("POST:", JSON.stringify(post, null, 2));

  // Serialise Leaflet blocks — replaces BlobRef/CID instances with PDS URLs
  let blocks: SerialisedBlock[] = [];
  let renderedContent = "";

  if (
    post.content &&
    typeof post.content === "object" &&
    leafletProvider.matches(post.content)
  ) {
    // Native block rendering: serialise blocks for Svelte components
    blocks = await serialiseBlocks(post.content, PUBLIC_ATPROTO_DID, fetchBlob);

    // Fallback: also render markdown for search, RSS, and non-JS contexts
    const result = await leafletProvider.toMarkdown(post.content, {
      fetchBlob,
    });
    renderedContent = await renderMarkdown(result.markdown);
  } else {
    const markdown =
      typeof post.content === "string" ? post.content : post.textContent || "";
    renderedContent = await renderMarkdown(markdown);
  }

  // Fetch comments via Constellation + Slingshot
  const comments = await fetchComments(post.uri, fetch);

  // Strip raw content before serialisation — it contains BlobRef/CID class
  // instances that SvelteKit cannot dehydrate across the server boundary.
  const { content: _content, ...serialisable } = post;

  return {
    post: {
      ...serialisable,
      createdAt: post.publishedAt,
      renderedContent,
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
