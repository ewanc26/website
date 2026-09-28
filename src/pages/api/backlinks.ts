import type { APIRoute } from "astro";
import { PUBLIC_ATPROTO_DID } from "$env/static/public";
import { fetchBacklinks } from "$lib/services/atproto";

const json = (data: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    headers: { "content-type": "application/json", ...headers },
  });

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

export const GET: APIRoute = async ({ url }) => {
  const targets = [
    ...new Set(
      url.searchParams
        .getAll("target")
        .filter((t) => t.length <= 500 && isOwnTarget(t)),
    ),
  ].slice(0, 10);

  if (targets.length === 0) return json({ people: [], mentions: 0 });

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

  for (const b of backlinks) {
    const existing = people.get(b.authorDid);
    if (existing) {
      existing.mentions += 1;
      continue;
    }
    people.set(b.authorDid, {
      did: b.authorDid,
      handle: b.authorHandle,
      displayName: b.authorDisplayName,
      avatarUrl: b.authorAvatarUrl,
      mentions: 1,
    });
  }

  return json(
    { people: [...people.values()], mentions: backlinks.length, backlinks },
    { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800" },
  );
};
