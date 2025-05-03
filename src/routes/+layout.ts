import { getProfile } from "$lib/components/profile/profile";
import type { Profile } from "$lib/components/profile/profile";

// Profile data cache
let profile: Profile;

export async function load() {
    if (profile === undefined) {
        profile = await getProfile();
    }
    return { 
        profile,
        posts: new Map() // Add empty posts map to match the expected type
    };
}