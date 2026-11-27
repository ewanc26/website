import { fetchSiteInfo } from "#lib/services/atproto/fetch.js";
import { normalizeSiteInfo } from "#lib/services/atproto/siteInfo.js";
import { getAlmanac } from "#lib/utils/almanac.js";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
  setHeaders({ "cache-control": "public, s-maxage=300, stale-while-revalidate=3600" });
  const info = normalizeSiteInfo(await fetchSiteInfo(fetch).catch(() => null));
  const almanac = getAlmanac();
  return { info, almanac };
};
