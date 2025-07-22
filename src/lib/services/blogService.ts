// src/lib/services/blogService.ts
import { getProfile } from "$lib/components/profile/profile";
import type { Profile, MarkdownPost, Post, BlogServiceResult } from "$lib/components/shared";
import { parse } from "$lib/parser";

// Cache for blog data
let profile: Profile;
let allPosts: Map<string, Post>;
let sortedPosts: Post[] = [];



/**
 * Validates and processes a single blog record
 */
function processRecord(data: any): MarkdownPost | null {
  const matches = data["uri"].split("/");
  const rkey = matches[matches.length - 1];
  
  // Enhanced debugging for development
  if (process.env.NODE_ENV === 'development') {
    console.log('=== Record Debug Info ===');
    console.log('URI:', data["uri"]);
    console.log('Data structure keys:', Object.keys(data));
  }
  
  // Try both access patterns to be safe
  const record = data["value"] || data.value;
  
  if (!record) {
    console.warn(`No record value found for ${rkey}`, {
      dataKeys: Object.keys(data),
    });
    return null;
  }
  
  // Validate URI format and visibility
  if (
    !matches ||
    matches.length !== 5 ||
    !record ||
    (record["visibility"] && record["visibility"] !== "public")
  ) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Post skipped due to validation failure:', {
        rkey,
        matchesLength: matches?.length,
        hasRecord: !!record,
        visibility: record?.["visibility"],
      });
    }
    return null;
  }

  // Extract fields with fallback patterns
  const content = record["content"] || record.content || (record.value && record.value.content);
  const title = record["title"] || record.title || (record.value && record.value.title);
  const createdAt = record["createdAt"] || record.createdAt || (record.value && record.value.createdAt);
  
  // Skip if missing required content
  if (!content) {
    console.warn(`Skipping post with missing content: ${rkey}`);
    return null;
  }

  // Handle createdAt - use current time as fallback for missing dates
  let createdAtDate: Date;
  if (!createdAt) {
    console.warn(`Post missing createdAt, using current time: ${rkey}`);
    createdAtDate = new Date();
  } else {
    createdAtDate = new Date(createdAt);
    
    // Skip posts with invalid dates
    if (isNaN(createdAtDate.getTime())) {
      console.warn(`Skipping post with invalid date: ${rkey}`, {
        rawCreatedAt: createdAt,
      });
      return null;
    }
  }

  // Use title if available, otherwise generate one
  const finalTitle = title || `Untitled Post (${rkey})`;

  return {
    title: finalTitle,
    createdAt: createdAtDate,
    mdcontent: content,
    rkey,
  };
}

/**
 * Fetches and processes all blog posts
 */
export async function loadAllPosts(fetch: typeof window.fetch): Promise<BlogServiceResult> {
  try {
    // Load profile if not cached
    if (profile === undefined) {
      profile = await getProfile(fetch);
    }

    // Load posts if not cached
    if (allPosts === undefined) {
      const rawResponse = await fetch(
        `${profile.pds}/xrpc/com.atproto.repo.listRecords?repo=${profile.did}&collection=com.whtwnd.blog.entry`
      );

      if (!rawResponse.ok) {
        throw new Error(`Failed to fetch posts: ${rawResponse.status}`);
      }

      const response = await rawResponse.json();

      if (!response.records || response.records.length === 0) {
        allPosts = new Map();
        sortedPosts = [];
      } else {
        const mdposts: Map<string, MarkdownPost> = new Map();
        
        // Process all records
        for (const data of response.records) {
          const processedPost = processRecord(data);
          if (processedPost) {
            mdposts.set(processedPost.rkey, processedPost);
          }
        }
        
        console.log(`Successfully processed ${mdposts.size} posts out of ${response.records.length} total records`);
        
        // Parse markdown content
        allPosts = await parse(mdposts);
        sortedPosts = Array.from(allPosts.values()).sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );
      }
    }

    return {
      posts: allPosts,
      profile,
      sortedPosts,
      getPost: (rkey: string) => allPosts.get(rkey) || null,
      getAdjacentPosts: (rkey: string): { previous: Post | null; next: Post | null } => {
        const index = sortedPosts.findIndex((post) => post.rkey === rkey);
        return {
          previous: index > 0 ? sortedPosts[index - 1] : null,
          next: index < sortedPosts.length - 1 ? sortedPosts[index + 1] : null,
        };
      },
    };
  } catch (error) {
    console.error("Error in loadAllPosts:", error);
    return {
      posts: new Map(),
      profile: profile || ({} as Profile),
      sortedPosts: [],
      getPost: () => null,
      getAdjacentPosts: () => ({ previous: null, next: null }),
    };
  }
}

/**
 * Gets the latest N blog posts (for homepage display)
 */
export async function getLatestPosts(fetch: typeof window.fetch, limit: number = 3): Promise<Post[]> {
  try {
    const { sortedPosts } = await loadAllPosts(fetch);
    return sortedPosts.slice(0, limit);
  } catch (error) {
    console.error("Error fetching latest posts:", error);
    return [];
  }
}

/**
 * Clears the cache (useful for testing or force refresh)
 */
export function clearCache(): void {
  profile = undefined as any;
  allPosts = undefined as any;
  sortedPosts = [];
}