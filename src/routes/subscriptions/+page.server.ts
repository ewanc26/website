import { fetchSubscriptions, fetchRecommendations } from "$lib/services/atproto/fetch";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
  setHeaders({ "cache-control": "public, s-maxage=300, stale-while-revalidate=600" });
  const [subscriptions, recommendations] = await Promise.all([
    fetchSubscriptions(fetch).catch(() => []),
    fetchRecommendations(fetch).catch(() => []),
  ]);
  return { subscriptions, recommendations };
};
