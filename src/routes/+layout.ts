import { getProfile, getSiteInfo } from "$components/profile/profile";
import type { Profile, LinkBoard, SiteInfo } from "$components/shared";

// Profile and site data cache
let profile: Profile;
let siteInfo: SiteInfo | null = null;

export async function load({ fetch }) {
  try {
    // Critical path: Load only essential profile data
    console.log('Layout load: Starting critical path');
    
    if (profile === undefined) {
      profile = await getProfile(fetch);
    }

    // Load site info if not already cached
    if (siteInfo === null) {
      try {
        siteInfo = await getSiteInfo(fetch);
      } catch (error) {
        console.warn('Failed to load site info, continuing without it:', error);
        siteInfo = null;
      }
    }

    console.log('Layout load: Profile and site info loaded, returning minimal data');

    // Return immediately with only critical data
    return {
      profile,
      siteInfo,
      pdsUrl: profile.pds,
      did: profile.did,
      posts: new Map(), // Keep this for compatibility
      dynamicLinks: undefined, // Will be loaded client-side
      latestPosts: [], // Will be loaded client-side
    };

  } catch (error) {
    console.error("Critical error in layout load:", error);
    
    // Return minimal fallback data structure
    return {
      profile: {
        avatar: '',
        banner: '',
        displayName: 'Loading...',
        did: '',
        handle: 'loading',
        description: '',
        pds: '',
      } as Profile,
      siteInfo: null,
      pdsUrl: '',
      did: '',
      posts: new Map(),
      dynamicLinks: undefined,
      latestPosts: [],
    };
  }
}