import { fetchRecommendations } from "$lib/services/atproto/fetch";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ fetch, setHeaders }) => {
  const recommendations = await fetchRecommendations(fetch);
  setHeaders({ "cache-control": "public, s-maxage=300, stale-while-revalidate=600" });
  return json(recommendations);
};
