import type { Profile, SiteInfo } from "$lib/components/profile/profile";
import { getProfile, getSiteInfo } from "$lib/components/profile/profile";

export const prerender = false;
export const trailingSlash = "never";

import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch }) => {
  let profile: Profile | null = null;
  let siteInfo: SiteInfo | null = null;

  try {
    // Fetch site info using the utility function
    siteInfo = await getSiteInfo(fetch);

    // Fetch profile data
    profile = await getProfile(fetch);

    return {
      siteInfo,
      profile,
    };
  } catch (error) {
    console.error("Error in load function for /info:", error);
    return {
      siteInfo: null,
      profile: null,
    };
  }
}