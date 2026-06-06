import { json } from "@sveltejs/kit";
import { fetchRecommendations } from "$lib/services/atproto/fetch";
import type { RequestHandler } from "./$types";
import type { Config } from "@sveltejs/adapter-vercel";

export const config: Config = { maxDuration: 60 };

export const GET: RequestHandler = async ({ fetch }) => {
  const recommendations = await fetchRecommendations(fetch);
  return json(recommendations, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
};
