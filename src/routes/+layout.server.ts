import { fetchSiteInfo } from "#lib/services/atproto/fetch.js";
import { normalizeSiteInfo } from "#lib/services/atproto/siteInfo.js";
import { getDynamicThemeCSS } from "#lib/server/theme.js";
import { getAlmanac } from "#lib/utils/almanac.js";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ fetch }) => {
  const almanac = getAlmanac();
  const siteInfo = normalizeSiteInfo(await fetchSiteInfo(fetch).catch(() => null));
  const dynamicThemeCss = getDynamicThemeCSS();

  return { almanac, siteInfo, dynamicThemeCss };
};
