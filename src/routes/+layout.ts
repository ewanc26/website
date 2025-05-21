import { getProfile } from "$lib/components/profile/profile";
import type { Profile } from "$lib/components/profile/profile";

// Profile data cache
let profile: Profile;

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
    profile = await getProfile();
  }

  let dynamicLinks: LinkBoard | undefined;
  try {
    const rawResponse = await fetch(
      `${profile.pds}/xrpc/com.atproto.repo.listRecords?repo=${profile.did}&collection=blue.linkat.board&rkey=self`
    );
    const response = await rawResponse.json();
    // Assuming the response structure matches the LinkBoard interface
    if (response && response.records && response.records.length > 0) {
      dynamicLinks = response.records[0].value as LinkBoard;
    }
  } catch (error) {
    console.error("Error fetching dynamic links:", error);
    // Handle error or return undefined links
  }

  return {
    profile,
    posts: new Map(), // Add empty posts map to match the expected type
    dynamicLinks, // Return the fetched dynamic links
  };
}
