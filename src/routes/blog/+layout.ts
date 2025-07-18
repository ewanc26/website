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
        
        // Enhanced debugging – log the full structure
        console.log('=== Record Debug Info ===');
        console.log('Raw data keys:', Object.keys(data));
        console.log('URI:', data["uri"]);
        console.log('Data structure:', data);
        console.log('data["value"] exists:', !!data["value"]);
        console.log('data.value exists:', !!data.value);
        console.log('========================');
        
        // Try both access patterns to be safe
        const record = data["value"] || data.value;
        
        if (!record) {
          console.warn(`No record value found for ${rkey}`, {
            dataKeys: Object.keys(data),
            data: data
          });
          continue;
        }
        
        console.log('Record after extraction:', record);
        console.log('Record keys:', Object.keys(record));
        
        if (
          matches &&
          matches.length === 5 &&
          record &&
          (record["visibility"] === "public" || !record["visibility"])
        ) {
          // Check if record has required fields with more robust checking
          const content = record["content"] || record.content;
          const title = record["title"] || record.title;
          const createdAt = record["createdAt"] || record.createdAt;
          
          // Additional safety check - if we still don't have content, check if we need to go deeper
          const actualContent = content || (record.value && record.value.content);
          const actualTitle = title || (record.value && record.value.title);
          const actualCreatedAt = createdAt || (record.value && record.value.createdAt);
          
          const hasContent = actualContent !== undefined && actualContent !== null && actualContent !== "";
          const hasTitle = actualTitle !== undefined && actualTitle !== null;
          const hasCreatedAt = actualCreatedAt !== undefined && actualCreatedAt !== null;
          
          console.log('Field validation:', {
            rkey,
            hasContent,
            hasTitle,
            hasCreatedAt,
            title: actualTitle,
            createdAt: actualCreatedAt,
            contentLength: actualContent?.length || 0,
            contentType: typeof actualContent,
            recordKeys: Object.keys(record),
            recordHasValueProp: 'value' in record,
            recordStringified: JSON.stringify(record).substring(0, 200) + '...'
          });

          // Skip if missing required content
          if (!hasContent) {
            console.warn(`Skipping post with missing content: ${rkey}`, {
              record,
              contentValue: actualContent,
              contentType: typeof actualContent,
              recordKeys: Object.keys(record),
              recordHasValueProp: 'value' in record
            });
            continue;
          }

          // Handle missing createdAt – use current time as fallback or skip
          let createdAtDate: Date;
          if (!hasCreatedAt) {
            console.warn(`Post missing createdAt, using current time: ${rkey}`, {
              title: actualTitle,
              availableFields: Object.keys(record)
            });
            // Option 1: Use current time as fallback
            createdAtDate = new Date();
            // Option 2: Skip posts without createdAt (uncomment line below)
            // continue;
          } else {
            createdAtDate = new Date(actualCreatedAt);
            
            // Skip posts with invalid dates
            if (isNaN(createdAtDate.getTime())) {
              console.warn(`Skipping post with invalid date: ${rkey}`, {
                title: actualTitle,
                rawCreatedAt: actualCreatedAt,
                rawCreatedAtType: typeof actualCreatedAt
              });
              continue;
            }
          }

          // Use title if available, otherwise generate one
          const finalTitle = actualTitle || `Untitled Post (${rkey})`;

          mdposts.set(rkey, {
            title: finalTitle,
            createdAt: createdAtDate,
            mdcontent: actualContent,
            rkey,
          });
        } else {
          console.warn('Post skipped due to validation failure:', {
            rkey,
            matchesLength: matches?.length,
            hasRecord: !!record,
            visibility: record?.["visibility"],
            reason: !matches || matches.length !== 5 
              ? 'Invalid URI format' 
              : !record 
                ? 'No record data'
                : 'Visibility not public'
          });
        }
      }
      
      console.log(`Successfully processed ${mdposts.size} posts out of ${response.records.length} total records`);
      
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