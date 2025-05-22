import type { Profile, ProfessionalInfo } from "$lib/components/profile/profile";
import { getProfile, getProfessionalInfo } from "$lib/components/profile/profile";

export const prerender = false;
export const trailingSlash = "never";

import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async () => {
  let profile: Profile | null = null;
  let professionalInfo: ProfessionalInfo | null = null;

  try {
    // Fetch professional info using the utility function
    professionalInfo = await getProfessionalInfo();

    // Fetch profile data
    profile = await getProfile();

    return {
      professionalInfo,
      profile,
    };
  } catch (error) {
    console.error("Error in load function:", error);
    return {
      professionalInfo: null,
      profile: null,
    };
  }
}