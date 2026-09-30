import { fetchDocuments } from "@ewanc26/atproto";
import { fetchBlob } from "$lib/services/atproto";
import { PUBLIC_ATPROTO_DID } from "$env/static/public";
import { renderMarkdown } from "$lib/utils/markdown";
import { leafletProvider, serialiseBlocks, type SerialisedBlock } from "$lib/providers";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

const RKEY = "3mnivbrtqc22b";

export const load: PageServerLoad = async ({ fetch }) => {
  const { documents } = await fetchDocuments(PUBLIC_ATPROTO_DID, fetch).catch(() => ({ documents: [] as any[] }));
  const post = documents.find((d) => d.uri.endsWith(`/${RKEY}`));
  if (!post) error(404);

  const excerpt = (post.textContent ?? "").replace(/[#*`_~\[\]()\-]/g, "").replace(/\s+/g, " ").trim();
  const meta = post.description || (excerpt ? (excerpt.length > 155 ? `${excerpt.slice(0, 152)}...` : excerpt) : `Read ${post.title} on ewancroft.uk.`);

  let blocks: SerialisedBlock[] = [];
  let html = "";
  if (post.content && typeof post.content === "object" && leafletProvider.matches(post.content)) {
    blocks = await serialiseBlocks(post.content, PUBLIC_ATPROTO_DID, fetchBlob);
    html = await renderMarkdown((await leafletProvider.toMarkdown(post.content, { fetchBlob })).markdown);
  } else {
    html = await renderMarkdown(typeof post.content === "string" ? post.content : post.textContent || "");
  }

  return { post, meta, blocks, html };
};
