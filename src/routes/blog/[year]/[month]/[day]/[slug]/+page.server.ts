import type { PageServerLoad } from "./$types";
import type { Config } from "@sveltejs/adapter-vercel";
import { fetchDocuments, fetchPublications } from "@ewanc26/atproto";
import { fetchBlob, fetchComments } from "$lib/services/atproto";
import {
  PUBLIC_ATPROTO_DID,
  PUBLIC_LEAFLET_BLOG_PUBLICATION,
} from "$env/static/public";
import { error } from "@sveltejs/kit";
import { normalizeSlug } from "$lib/utils/slugify";
import { blogDateParts } from "$lib/utils/date";
import { safeResourceUrl } from "$lib/utils/url";
import { renderMarkdown } from "$lib/utils/markdown";
import {
  leafletProvider,
  serialiseContent,
  type SerialisedBlock,
  type SerialisedPage,
} from "$lib/providers";

export const config: Config = { maxDuration: 60 };

export const load: PageServerLoad = async ({ params, fetch, setHeaders }) => {
  // Long cache — posts don’t change often; Vercel CDN takes the burden off the
  // cold function for repeated visitors.
  setHeaders({
    "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
  });
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
    const { year: y, month: m, day: dStr } = blogDateParts(d.publishedAt);
    const docSlug = normalizeSlug(d.title);
    return y === year && m === month && dStr === day && docSlug === slug;
  });

  if (!post) {
    throw error(404, "Post not found");
  }

  const cleanExcerpt = (text: string) => {
    return text
      .replace(/[#*`_~\[\]()\-]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  let metaDescription = post.description ?? "";
  if (!metaDescription && post.textContent) {
    const excerpt = cleanExcerpt(post.textContent);
    metaDescription =
      excerpt.length > 155 ? excerpt.slice(0, 152) + "..." : excerpt;
  }
  if (!metaDescription) {
    metaDescription = `Read ${post.title} on the blog.`;
  }

  let blocks: SerialisedBlock[] = [];
  let pages: SerialisedPage[] = [];
  let primaryPageType: string | undefined;
  let primaryPageId: string | undefined;
  let renderedContent = "";

  if (
    post.content &&
    typeof post.content === "object" &&
    leafletProvider.matches(post.content)
  ) {
    const serialised = await serialiseContent(
      post.content,
      PUBLIC_ATPROTO_DID,
      fetchBlob,
    );
    blocks = serialised.blocks;
    pages = serialised.pages;
    primaryPageType = serialised.primaryPageType;
    primaryPageId = serialised.primaryPageId;

    // Keep the existing Markdown fallback for old/non-JS clients and records
    // that predate native block rendering. Lossy conversion is deliberately
    // separate from the native Leaflet reader path.
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
  const publicationUrl = safeResourceUrl(blogPublication?.url);

  const readerPosts = publicationDocs
    .map((document) => {
      const date = blogDateParts(document.publishedAt);
      return {
        uri: document.uri,
        title: document.title,
        description: document.description ?? undefined,
        createdAt: document.publishedAt,
        tags: document.tags ?? [],
        url: `/blog/${date.year}/${date.month}/${date.day}/${normalizeSlug(document.title)}`,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  return {
    post: {
      ...serialisable,
      createdAt: post.publishedAt,
      renderedContent,
      metaDescription,
      blocks,
      pages,
      primaryPageType,
      primaryPageId,
    },
    readerPosts,
    blog: blogPublication
      ? {
          uri: blogPublication.uri,
          title: blogPublication.name,
          description: blogPublication.description ?? "",
          // The publication URL comes from a remote record; only emit it as
          // a link target when it is a real http(s) URL.
          url: publicationUrl,
          rss: publicationUrl
            ? `${publicationUrl.replace(/\/+$/, "")}/rss`
            : undefined,
        }
      : null,
    comments,
  };
};
