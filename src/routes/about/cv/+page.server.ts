import { PUBLIC_ATPROTO_DID } from "$env/static/public";
import { gatherCvData } from "$lib/server/cv/data";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
  setHeaders({ "cache-control": "public, s-maxage=300, stale-while-revalidate=3600" });
  const cv = await gatherCvData(PUBLIC_ATPROTO_DID, fetch);
  return { cv };
};
