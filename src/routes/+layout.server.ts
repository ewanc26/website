import type { LayoutServerLoad } from "./$types";
import { fetchSiteInfo } from "$lib/services/atproto/fetch";
import { normalizeSiteInfo } from "$lib/services/atproto/siteInfo";

export const load: LayoutServerLoad = async ({ fetch }) => {
  const siteInfo = normalizeSiteInfo(await fetchSiteInfo(fetch));
  return { siteInfo };
};
