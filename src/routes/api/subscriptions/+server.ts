import { fetchSubscriptions } from "$lib/services/atproto/fetch";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

// Pulled forward from the general API-route porting phase since the
// owner opted into making /subscriptions genuinely live during this
// migration, matching the Astro route's response shape/caching exactly.
export const GET: RequestHandler = async ({ fetch, setHeaders }) => {
  const subscriptions = await fetchSubscriptions(fetch);
  setHeaders({ "cache-control": "public, s-maxage=300, stale-while-revalidate=600" });
  return json(subscriptions);
};
