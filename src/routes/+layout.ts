import { getProfile } from "$components/profile/profile";
import { preloadEssentialData } from "$services/blogService";
import type { Profile, LinkBoard } from "$components/shared";

// Profile data cache
let profile: Profile;

export async function load({ fetch }) {
  try {
    // Critical path: Load only essential profile data
    console.log('Layout load: Starting critical path');
    
    if (profile === undefined) {
      profile = await getProfile(fetch);
    }

    console.log('Layout load: Profile loaded, returning minimal data');

    // Return immediately with only critical data
    return {
      profile,
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
      pdsUrl: '',
      did: '',
      posts: new Map(),
      dynamicLinks: undefined,
      latestPosts: [],
    };
  }
}