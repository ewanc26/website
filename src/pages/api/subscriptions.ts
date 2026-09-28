import type { APIRoute } from "astro";
import { fetchSubscriptions } from "$lib/services/atproto/fetch";

const json = (data: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    headers: { "content-type": "application/json", ...headers },
  });

export const GET: APIRoute = async () =>
  json(await fetchSubscriptions(fetch), {
    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
  });
