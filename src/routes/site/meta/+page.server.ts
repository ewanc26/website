import type { PageServerLoad } from "./$types";
import { fetchSiteInfo } from "$lib/services/atproto/fetch";

export const load: PageServerLoad = async () => {
  let siteInfo = null;
  let error = null;

  try {
    siteInfo = await fetchSiteInfo();
  } catch (err) {
    error =
      err instanceof Error ? err.message : "Failed to load site information";
  }

  return { siteInfo, error };
};
