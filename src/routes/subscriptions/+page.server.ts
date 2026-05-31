import type { PageServerLoad } from "./$types";
import {
  fetchSubscriptions,
  fetchRecommendations,
} from "$lib/services/atproto/fetch";

export const load: PageServerLoad = async ({ fetch }) => {
  const [subscriptions, recommendations] = await Promise.all([
    fetchSubscriptions(fetch),
    fetchRecommendations(fetch),
  ]);
  return { subscriptions, recommendations };
};
