import { getProfile } from "$lib/components/profile/profile";
import type { Profile, LinkBoard } from "$lib/components/shared";

// Profile data cache
let profile: Profile;
let dynamicLinks: LinkBoard | undefined;

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

  return {
    profile,
    pdsUrl: profile.pds, // Add pdsUrl from profile
    did: profile.did, // Add did from profile
    posts: new Map(), // Add empty posts map to match the expected type
    dynamicLinks,

  };
}
