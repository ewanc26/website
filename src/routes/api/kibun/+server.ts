import { fetchKibunStatus } from "$lib/services/atproto/fetch";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

/**
 * New in the SvelteKit port: the Astro site fetched kibun status once
 * per homepage render with no live update. The owner opted into making
 * this genuinely live as part of the migration, using the same polling
 * widget pattern as NowPlaying.
 */
export const GET: RequestHandler = async ({ fetch, setHeaders }) => {
  const status = await fetchKibunStatus(fetch).catch(() => null);
  setHeaders({ "cache-control": "public, s-maxage=30, stale-while-revalidate=60" });
  return json({ status });
};
