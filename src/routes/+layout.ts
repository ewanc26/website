import { getProfile } from "$components/profile/profile";
import { getLatestPosts } from "$services/blogService";
import type { Profile, LinkBoard } from "$components/shared";

// Profile data cache
let profile: Profile;
let dynamicLinks: LinkBoard | undefined;

export async function load({ fetch }) {
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

  // Fetch latest blog posts using the consolidated service
  const latestPosts = await getLatestPosts(fetch, 3);

  return {
    profile,
    pdsUrl: profile.pds,
    did: profile.did,
    posts: new Map(), // Keep this for compatibility with existing Footer component
    dynamicLinks,
    latestPosts,
  };
}