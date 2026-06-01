import { json } from "@sveltejs/kit";
import { fetchSubscriptions } from "$lib/services/atproto/fetch";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ fetch }) => {
  const subscriptions = await fetchSubscriptions(fetch);
  return json(subscriptions);
};
