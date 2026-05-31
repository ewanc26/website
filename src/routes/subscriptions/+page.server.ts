import type { PageServerLoad } from "./$types";
import { fetchSubscriptions } from "$lib/services/atproto/fetch";

export const load: PageServerLoad = async ({ fetch }) => {
  const subscriptions = await fetchSubscriptions(fetch);
  return { subscriptions };
};
