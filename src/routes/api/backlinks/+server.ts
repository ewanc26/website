import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import type { Config } from "@sveltejs/adapter-vercel";
import { PUBLIC_ATPROTO_DID } from "$env/static/public";
import { fetchBacklinks } from "$lib/services/atproto";

export const config: Config = { maxDuration: 30 };

function isOwnTarget(target: string): boolean {
  if (target.startsWith(`at://${PUBLIC_ATPROTO_DID}/`)) return true;

  try {
    const url = new URL(target);
    return (
      url.protocol === "https:" &&
      (url.hostname === "ewancroft.uk" ||
        url.hostname.endsWith(".ewancroft.uk"))
    );
  } catch {
    return false;
  }
}

export const GET: RequestHandler = async ({ url, fetch }) => {
  const targets = [
    ...new Set(
      url.searchParams
        .getAll("target")
        .filter((target) => target.length <= 500 && isOwnTarget(target)),
    ),
  ].slice(0, 10);

  if (targets.length === 0) {
    return json({ people: [], mentions: 0 });
  }

  const backlinks = await fetchBacklinks(targets, fetch);
  const people = new Map<
    string,
    {
      did: string;
      handle: string;
      displayName?: string;
      avatarUrl?: string;
      mentions: number;
    }
  >();

  for (const backlink of backlinks) {
    const existing = people.get(backlink.authorDid);
    if (existing) {
      existing.mentions += 1;
      continue;
    }
    people.set(backlink.authorDid, {
      did: backlink.authorDid,
      handle: backlink.authorHandle,
      displayName: backlink.authorDisplayName,
      avatarUrl: backlink.authorAvatarUrl,
      mentions: 1,
    });
  }

  return json(
    {
      people: [...people.values()],
      mentions: backlinks.length,
      backlinks,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800",
      },
    },
  );
};
