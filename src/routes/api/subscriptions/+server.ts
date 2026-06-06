import { json } from "@sveltejs/kit";
import { fetchSubscriptions } from "$lib/services/atproto/fetch";
import type { RequestHandler } from "./$types";
import type { Config } from "@sveltejs/adapter-vercel";

export const config: Config = { maxDuration: 60 };

export const GET: RequestHandler = async ({ fetch }) => {
  const subscriptions = await fetchSubscriptions(fetch);
  return json(subscriptions, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
};
