/**
 * Recent Bluesky posts — top-level only (replies excluded; a feed of
 * "reply to so-and-so" out of context isn't representative). Bounded to a
 * handful of pages so a quiet stretch of nothing-but-replies can't force
 * a long pagination walk at request time.
 *
 * Every embed shape a post can actually carry is handled explicitly:
 * images, an external link card, video, a quote post, and a quote with
 * its own media attached. A post with no text but a real embed (a bare
 * photo, a bare quote) is still a real post — the previous version
 * silently dropped anything without text, which drops every one of
 * those.
 */

import { getPDSAgent } from "@ewanc26/atproto";
import { getCache, setCache } from "$lib/utils/cache";

export type FeedPostKind =
  | "text"
  | "images"
  | "external"
  | "video"
  | "quote"
  | "quote-media";

export interface FeedPost {
  uri: string;
  rkey: string;
  text: string;
  createdAt: string;
  kind: FeedPostKind;
  imageCount?: number;
  /** First image, or the external card's thumbnail — both public on cdn.bsky.app. */
  thumbUrl?: string;
  linkTitle?: string;
  /** bsky.app permalink for the quoted post, when the embed is a quote of a post. */
  quotedHref?: string;
  quotedUri?: string;
  /** Resolved from the public AppView; absent if the quoted post is gone or the lookup failed. */
  quoted?: { author: string; text: string };
}

const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes — posts move fast
const MAX_PAGES = 5;
const PAGE_SIZE = 50;

/** cid.toString() is the CID's own string form — see apps.ts for why not .ref.$link. */
const cidOf = (blob: unknown): string | undefined =>
  (
    blob as { ref?: { toString?: () => string } } | undefined
  )?.ref?.toString?.();

const thumbUrl = (did: string, cid: string | undefined): string | undefined =>
  cid
    ? `https://cdn.bsky.app/img/feed_thumbnail/plain/${did}/${cid}@jpeg`
    : undefined;

function bskyPermalink(atUri: string | undefined): string | undefined {
  const m = atUri?.match(
    /^at:\/\/(did:[^/]+)\/app\.bsky\.feed\.post\/([^/]+)$/,
  );
  return m ? `https://bsky.app/profile/${m[1]}/post/${m[2]}` : undefined;
}

interface EmbedInfo {
  kind: FeedPostKind;
  imageCount?: number;
  thumbUrl?: string;
  linkTitle?: string;
  quotedHref?: string;
  quotedUri?: string;
}

function describeEmbed(embed: any, did: string): EmbedInfo {
  switch (embed?.$type) {
    case "app.bsky.embed.images":
      return {
        kind: "images",
        imageCount: embed.images?.length,
        thumbUrl: thumbUrl(did, cidOf(embed.images?.[0]?.image)),
      };
    case "app.bsky.embed.external":
      return {
        kind: "external",
        linkTitle: embed.external?.title,
        thumbUrl: thumbUrl(did, cidOf(embed.external?.thumb)),
      };
    case "app.bsky.embed.video":
      return { kind: "video" };
    case "app.bsky.embed.record":
      // A bare quote: embed.record is the strong ref itself.
      return {
        kind: "quote",
        quotedHref: bskyPermalink(embed.record?.uri),
        quotedUri: embed.record?.uri,
      };
    case "app.bsky.embed.recordWithMedia": {
      // A quote plus its own media: embed.record wraps another
      // app.bsky.embed.record, one level deeper than the bare-quote case.
      const media = describeEmbed(embed.media, did);
      return {
        ...media,
        kind: "quote-media",
        quotedHref: bskyPermalink(embed.record?.record?.uri),
        quotedUri: embed.record?.record?.uri,
      };
    }
    default:
      return { kind: "text" };
  }
}

export async function fetchRecentPosts(
  did: string,
  fetchFn: typeof fetch = fetch,
  want = 6,
): Promise<FeedPost[]> {
  const cacheKey = `recent-posts:${did}:${want}`;
  const cached = getCache<FeedPost[]>(cacheKey);
  if (cached) return cached;

  const agent = await getPDSAgent(did, fetchFn);
  const posts: FeedPost[] = [];
  let cursor: string | undefined;

  for (let page = 0; page < MAX_PAGES && posts.length < want; page++) {
    const resp = await agent.com.atproto.repo.listRecords({
      repo: did,
      collection: "app.bsky.feed.post",
      limit: PAGE_SIZE,
      cursor,
      reverse: false,
    });
    for (const { uri, value } of resp.data.records) {
      const v = value as {
        text?: string;
        reply?: unknown;
        createdAt?: string;
        embed?: unknown;
      };
      if (v.reply) continue;

      const text = v.text?.trim() ?? "";
      const info = describeEmbed(v.embed, did);
      if (!text && info.kind === "text") continue; // truly nothing to show

      posts.push({
        uri,
        rkey: uri.split("/").pop() ?? "",
        text,
        createdAt: v.createdAt ?? "",
        ...info,
      });
      if (posts.length >= want) break;
    }
    cursor = resp.data.cursor;
    if (!cursor) break;
  }

  await attachQuoted(posts, fetchFn);

  setCache(cacheKey, posts, CACHE_TTL_MS);
  return posts;
}

/** One batched getPosts call (max 25 URIs) covers every quote in the feed. */
async function attachQuoted(posts: FeedPost[], fetchFn: typeof fetch) {
  const uris = [
    ...new Set(posts.map((p) => p.quotedUri).filter((u): u is string => !!u)),
  ].slice(0, 25);
  if (!uris.length) return;
  try {
    const qs = uris.map((u) => `uris=${encodeURIComponent(u)}`).join("&");
    const res = await fetchFn(
      `https://public.api.bsky.app/xrpc/app.bsky.feed.getPosts?${qs}`,
    );
    if (!res.ok) return;
    const data = (await res.json()) as {
      posts?: {
        uri: string;
        author?: { handle?: string; displayName?: string };
        record?: { text?: string };
      }[];
    };
    const byUri = new Map((data.posts ?? []).map((q) => [q.uri, q]));
    for (const p of posts) {
      const q = p.quotedUri ? byUri.get(p.quotedUri) : undefined;
      if (!q) continue;
      const handle = q.author?.handle ? `@${q.author.handle}` : "";
      p.quoted = {
        author: q.author?.displayName?.trim() || handle,
        text: (q.record?.text ?? "").trim(),
      };
    }
  } catch {
    // Quote context is decoration; the feed works without it.
  }
}
