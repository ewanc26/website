import { fetchSiteInfo } from "$lib/services/atproto/fetch";
import { normalizeSiteInfo } from "$lib/services/atproto/siteInfo";
import { getDynamicThemeCSS } from "$lib/server/theme";
import { getAlmanac } from "$lib/utils/almanac";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ fetch }) => {
  const almanac = getAlmanac();
  const siteInfo = normalizeSiteInfo(await fetchSiteInfo(fetch).catch(() => null));
  const dynamicThemeCss = getDynamicThemeCSS();

  return { almanac, siteInfo, dynamicThemeCss };
};
