import type { PageServerLoad } from "./$types";
import { fetchDocuments, fetchPublications } from "@ewanc26/atproto";
import { fetchBlob, fetchComments } from "$lib/services/atproto";
import {
  PUBLIC_ATPROTO_DID,
  PUBLIC_LEAFLET_BLOG_PUBLICATION,
} from "$env/static/public";
import { error } from "@sveltejs/kit";
import { renderMarkdown } from "$lib/utils/markdown";
import {
  leafletProvider,
  serialiseBlocks,
  type SerialisedBlock,
} from "$lib/providers";

const RKEY = "3mnivbrtqc22b";

export const load: PageServerLoad = async ({ fetch }) => {
  const [{ documents }, { publications }] = await Promise.all([
    fetchDocuments(PUBLIC_ATPROTO_DID, fetch).catch(() => ({ documents: [] })),
    fetchPublications(PUBLIC_ATPROTO_DID, fetch).catch(() => ({
      publications: [],
    })),
  ]);

  const blogPublication = publications.find(
    (p) => p.rkey === PUBLIC_LEAFLET_BLOG_PUBLICATION,
  );

  const post = documents.find((d) => d.uri.endsWith(`/${RKEY}`));

  if (!post) {
    throw error(404, "Post not found");
  }

  const cleanExcerpt = (text: string) =>
    text
      .replace(/[#*`_~\[\]()\-]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  let metaDescription = post.description ?? "";
  if (!metaDescription && post.textContent) {
    const excerpt = cleanExcerpt(post.textContent);
    metaDescription =
      excerpt.length > 155 ? excerpt.slice(0, 152) + "..." : excerpt;
  }
  if (!metaDescription) {
    metaDescription = `Read ${post.title} on ewancroft.uk.`;
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
