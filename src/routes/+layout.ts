import { getProfile, getProfessionalInfo } from "$lib/components/profile/profile";
import type { Profile, ProfessionalInfo } from "$lib/components/profile/profile";

// Profile data cache
let profile: Profile;
let dynamicLinks: LinkBoard | undefined;
let professionalInfo: ProfessionalInfo | null = null;

// Define the type for the fetched links data
interface LinkCard {
  url: string;
  text: string;
  emoji: string;
}

interface LinkBoard {
  $type: "blue.linkat.board";
  cards: LinkCard[];
}

export async function load({ fetch }) {
  if (profile === undefined) {
    profile = await getProfile(fetch);
  }



  if (profile === undefined) {
    profile = await getProfile(fetch);
  }

  // Fetch dynamic links only if not already cached
  if (dynamicLinks === undefined) {
    try {
      const rawResponse = await fetch(
        `${profile.pds}/xrpc/com.atproto.repo.listRecords?repo=${profile.did}&collection=blue.linkat.board&rkey=self`
      );
      const response = await rawResponse.json();
      if (response && response.records && response.records.length > 0) {
        dynamicLinks = response.records[0].value as LinkBoard;
      }
    } catch (error) {
      console.error("Error fetching dynamic links:", error);
    }
  }

  // Fetch professional info only if not already cached
  if (professionalInfo === null) {
    professionalInfo = await getProfessionalInfo(fetch);
  }

  return {
    profile,
    pdsUrl: profile.pds, // Add pdsUrl from profile
    did: profile.did, // Add did from profile
    posts: new Map(), // Add empty posts map to match the expected type
    dynamicLinks,
    professionalInfo, // Add professionalInfo to the returned data
  };
}
