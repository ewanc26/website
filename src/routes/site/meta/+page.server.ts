import type { PageServerLoad } from "./$types";
import { fetchSiteInfo } from "@ewanc26/atproto";
import { PUBLIC_ATPROTO_DID } from "$env/static/public";

export const load: PageServerLoad = async ({ fetch }) => {
  let siteInfo = null;
  let error = null;

  try {
    siteInfo = await fetchSiteInfo(PUBLIC_ATPROTO_DID, fetch);
  } catch (err) {
    error =
      err instanceof Error ? err.message : "Failed to load site information";
  }

  return { siteInfo, error };
};
