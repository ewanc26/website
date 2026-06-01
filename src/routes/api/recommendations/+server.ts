import { json } from "@sveltejs/kit";
import { fetchRecommendations } from "$lib/services/atproto/fetch";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ fetch }) => {
  const recommendations = await fetchRecommendations(fetch);
  return json(recommendations);
};
