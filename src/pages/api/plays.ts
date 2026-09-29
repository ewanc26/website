import type { APIRoute } from "astro";
import { fetchRecentPlays } from "$lib/services/atproto/plays";
import { PUBLIC_ATPROTO_DID } from "$env/static/public";

export const GET: APIRoute = async ({ url }) => {
  const parsed = parseInt(url.searchParams.get("limit") ?? "", 10);
  const limit = Number.isFinite(parsed) ? Math.min(10, Math.max(1, parsed)) : 5;
  try {
    const plays = await fetchRecentPlays(PUBLIC_ATPROTO_DID, limit, fetch);
    return new Response(JSON.stringify({ plays }), {
      headers: {
        "content-type": "application/json",
        "cache-control": "public, s-maxage=15, stale-while-revalidate=30",
      },
    });
  } catch {
    return new Response(JSON.stringify({ plays: [] }), {
      status: 502,
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
      },
    });
  }
};
