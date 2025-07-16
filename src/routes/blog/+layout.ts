import { getProfile } from "$lib/components/profile/profile";
import type { Profile } from "$lib/components/profile/profile";
import { parse, type MarkdownPost, type Post } from "$lib/parser";


let profile: Profile;
let posts: Map<string, Post>;
let sortedPosts: Post[] = [];

export const prerender = false;
export const trailingSlash = "never";

export async function load({ fetch }) {
  try {
    if (profile === undefined) {
      profile = await getProfile(fetch);
    }
    if (posts === undefined) {
      const rawResponse = await fetch(
        `${profile.pds}/xrpc/com.atproto.repo.listRecords?repo=${profile.did}&collection=com.whtwnd.blog.entry`
      );

      if (!rawResponse.ok) {
        throw new Error(`Failed to fetch posts: ${rawResponse.status}`);
      }

      const response = await rawResponse.json();

      if (!response.records || response.records.length === 0) {
        return {
          posts: new Map(),
          profile,
          sortedPosts: [],
          getPost: () => null,
          getAdjacentPosts: () => ({ previous: null, next: null })
        };
      }

      const mdposts: Map<string, MarkdownPost> = new Map();
      for (const data of response["records"]) {
        const matches = data["uri"].split("/");
        const rkey = matches[matches.length - 1];
        const record = data["value"];
        
        // Debug the full record structure
        console.log('Full record structure for', rkey, ':', {
          dataKeys: Object.keys(data),
          valueKeys: record ? Object.keys(record) : 'record is null/undefined',
          record: record,
          uri: data["uri"]
        });
        
        if (
          matches &&
          matches.length === 5 &&
          record &&
          (record["visibility"] === "public" || !record["visibility"])
        ) {
          // Debug the date parsing
          const rawCreatedAt = record["createdAt"];
          console.log('Processing post:', {
            rkey,
            title: record["title"],
            rawCreatedAt,
            rawCreatedAtType: typeof rawCreatedAt,
            parsedDate: rawCreatedAt ? new Date(rawCreatedAt) : 'No rawCreatedAt',
            isValidParsedDate: rawCreatedAt ? !isNaN(new Date(rawCreatedAt).getTime()) : false
          });

          if (!rawCreatedAt) {
            console.warn(`Skipping post with missing createdAt: ${rkey}`, {
              title: record["title"],
              availableFields: Object.keys(record)
            });
            continue;
          }

          const createdAtDate = new Date(rawCreatedAt);
          
          // Skip posts with invalid dates
          if (isNaN(createdAtDate.getTime())) {
            console.warn(`Skipping post with invalid date: ${rkey}`, {
              title: record["title"],
              rawCreatedAt,
              rawCreatedAtType: typeof rawCreatedAt
            });
            continue;
          }

          mdposts.set(rkey, {
            title: record["title"],
            createdAt: createdAtDate,
            mdcontent: record["content"],
            rkey,
          });
        }
      }
      posts = await parse(mdposts);
      sortedPosts = Array.from(posts.values()).sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );

    }

    return {
      posts,
      profile,
      sortedPosts,
      getPost: (rkey: string) => posts.get(rkey),
      getAdjacentPosts: (
        rkey: string
      ): { previous: Post | null; next: Post | null } => {
        const index = sortedPosts.findIndex((post) => post.rkey === rkey);
        return {
          previous: index > 0 ? sortedPosts[index - 1] : null,
          next: index < sortedPosts.length - 1 ? sortedPosts[index + 1] : null,
        };
      },
    };
  } catch (error) {
    console.error("Error in load function:", error);
    return {
      posts: new Map(),
      profile: null,
      sortedPosts: [],
      getPost: () => null,
      getAdjacentPosts: () => ({ previous: null, next: null }),
    };
  }
}