import { getProfile } from "$lib/components/profile/profile";
import type { Profile, LinkBoard, MarkdownPost, Post } from "$lib/components/shared";
import { parse } from "$lib/parser";

// Profile data cache
let profile: Profile;
let dynamicLinks: LinkBoard | undefined;
let latestPosts: Post[] = [];

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

  // Fetch latest blog posts if not already cached
  if (latestPosts.length === 0) {
    try {
      const rawResponse = await fetch(
        `${profile.pds}/xrpc/com.atproto.repo.listRecords?repo=${profile.did}&collection=com.whtwnd.blog.entry`
      );

      if (rawResponse.ok) {
        const response = await rawResponse.json();

        if (response.records && response.records.length > 0) {
          const mdposts: Map<string, MarkdownPost> = new Map();
          
          // Process only the latest few posts to keep it lightweight
          const recentRecords = response.records
            .filter((data: any) => {
              const matches = data["uri"].split("/");
              const record = data["value"] || data.value;
              return matches && matches.length === 5 && 
                     record && 
                     (record["visibility"] === "public" || !record["visibility"]);
            })
            .slice(0, 3); // Only process the latest 3 posts for the homepage

          for (const data of recentRecords) {
            const matches = data["uri"].split("/");
            const rkey = matches[matches.length - 1];
            const record = data["value"] || data.value;
            
            const content = record["content"] || record.content;
            const title = record["title"] || record.title;
            const createdAt = record["createdAt"] || record.createdAt;
            
            const actualContent = content || (record.value && record.value.content);
            const actualTitle = title || (record.value && record.value.title);
            const actualCreatedAt = createdAt || (record.value && record.value.createdAt);
            
            // Skip posts without content
            if (!actualContent) continue;

            let createdAtDate: Date;
            if (!actualCreatedAt) {
              createdAtDate = new Date();
            } else {
              createdAtDate = new Date(actualCreatedAt);
              if (isNaN(createdAtDate.getTime())) {
                continue;
              }
            }

            const finalTitle = actualTitle || `Untitled Post (${rkey})`;

            mdposts.set(rkey, {
              title: finalTitle,
              createdAt: createdAtDate,
              mdcontent: actualContent,
              rkey,
            });
          }

          if (mdposts.size > 0) {
            const parsedPosts = await parse(mdposts);
            latestPosts = Array.from(parsedPosts.values()).sort(
              (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
            );
          }
        }
      }
    } catch (error) {
      console.error("Error fetching latest blog posts:", error);
      latestPosts = [];
    }
  }

  return {
    profile,
    pdsUrl: profile.pds,
    did: profile.did,
    posts: new Map(), // Keep this for compatibility with existing Footer component
    dynamicLinks,
    latestPosts, // Add latest posts for the homepage
  };
}