import type { LayoutServerLoad } from './$types';
import { getProfile, getSiteInfo } from '$lib/components/profile/profile';

export const load: LayoutServerLoad = async ({ fetch }) => {
  // Load shared data for all pages
  const [profile, siteInfo] = await Promise.all([
    getProfile(fetch),
    getSiteInfo(fetch)
  ]);
  
  return {
    profile,
    siteInfo
  };
};
