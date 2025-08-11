import { getProfile } from "$components/profile/profile";
import type { Profile, MarkdownPost, Post, BlogServiceResult } from "$components/shared";
import { parse } from "$lib/parser";

// Caching profile and post data

let profile: Profile;
let allPosts: Map<string, Post> | undefined;
let sortedPosts: Post[] = [];


/**
 * Validates and processes a single blog record
 */
function processRecord(data: any): MarkdownPost | null {
  const matches = data["uri"].split("/");
  const rkey = matches[matches.length - 1];

  // Debugging output for development
  if (process.env.NODE_ENV === 'development') {
    console.log('=== Record Debug Info ===');
    console.log('URI:', data["uri"]);
    console.log('Data structure keys:', Object.keys(data));
  }

  // Safely access record object
  const record = data["value"] || data.value;

  if (!record) {
    console.warn(`No record value found for ${rkey}`, {
      dataKeys: Object.keys(data),
    });
    return null;
  }

  // Validate structure and public visibility
  if (!matches || matches.length !== 5 || !record || (record["visibility"] && record["visibility"] !== "public")) {
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

  // Fallback access patterns for fields
  const content = record["content"] || record.content || (record.value && record.value.content);
  const title = record["title"] || record.title || (record.value && record.value.title);
  const createdAt = record["createdAt"] || record.createdAt || (record.value && record.value.createdAt);

  // Skip record if content is missing
  if (!content) {
    console.warn(`Skipping post with missing content: ${rkey}`);
    return null;
  }

  // Parse or fallback for createdAt date
  let createdAtDate: Date;
  if (!createdAt) {
    console.warn(`Post missing createdAt, using current time: ${rkey}`);
    createdAtDate = new Date();
  } else {
    createdAtDate = new Date(createdAt);
    if (isNaN(createdAtDate.getTime())) {
      console.warn(`Skipping post with invalid date: ${rkey}`, {
        rawCreatedAt: createdAt,
      });
      return null;
    }
  }

  // Generate fallback title if none present
  const finalTitle = title || `Untitled Post (${rkey})`;

  return {
    title: finalTitle,
    createdAt: createdAtDate,
    mdcontent: content,
    rkey,
  };
}

/**
 * Fetches all blog records using pagination (cursor-based)
 */
async function loadAllPages(fetch: typeof window.fetch): Promise<any[]> {
  let allRecords: any[] = [];
  let cursor: string | undefined | null = undefined;
  let pageCount = 0;
  const MAX_PAGES = 10; // Prevent infinite loops

  do {
    // Construct request URL with optional cursor
    const url = new URL(`${profile.pds}/xrpc/com.atproto.repo.listRecords`);
    url.searchParams.set("repo", profile.did);
    url.searchParams.set("collection", "com.whtwnd.blog.entry");
    if (cursor) {
      url.searchParams.set("cursor", cursor);
    }

    // Add timeout to fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    try {
      const res = await fetch(url.toString(), { 
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) throw new Error(`Failed to fetch page: ${res.status}`);
      const body = await res.json();

      // Append new records
      if (body.records && Array.isArray(body.records)) {
        allRecords = allRecords.concat(body.records);
      }

      // Update cursor for next page
      cursor = body.cursor ?? null;
      pageCount++;
      
      // Safety check to prevent infinite loops
      if (pageCount >= MAX_PAGES) {
        console.warn(`Reached maximum page limit (${MAX_PAGES}), stopping pagination`);
        break;
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('Request timed out, returning partial results');
        break;
      }
      throw error;
    }
  } while (cursor);

  return allRecords;
}

/**
 * Loads and processes all blog posts, with pagination support
 */
export async function loadAllPosts(fetch: typeof window.fetch): Promise<BlogServiceResult> {
  try {
    // Add overall timeout for the entire operation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second total timeout

    try {
      // Load profile once
      if (profile === undefined) {
        profile = await getProfile(fetch);
      }

      // Always fetch fresh data for blog posts
      const records = await loadAllPages(fetch);

      const mdposts: Map<string, MarkdownPost> = new Map();
      for (const data of records) {
        const processed = processRecord(data);
        if (processed) {
          mdposts.set(processed.rkey, processed);
        }
      }

      // Convert markdown posts to full post format
      allPosts = await parse(mdposts);

      // Sort posts chronologically (newest first)
      sortedPosts = Array.from(allPosts.values()).sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );

      // Assign reverse post numbers
      const total = sortedPosts.length;
      sortedPosts.forEach((post, index) => {
        post.postNumber = total - index;
      });

      clearTimeout(timeoutId);
      
      return {
        posts: allPosts,
        profile,
        sortedPosts,
        getPost: (rkey: string) => allPosts?.get(rkey) ?? null,
        getAdjacentPosts: (rkey: string) => {
          const idx = sortedPosts.findIndex(p => p.rkey === rkey);
          return {
            previous: idx > 0 ? sortedPosts[idx - 1] : null,
            next: idx < sortedPosts.length - 1 ? sortedPosts[idx + 1] : null,
          };
        },
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('Blog loading timed out, returning cached data if available');
        // Return cached data if available, otherwise empty result
        if (allPosts && sortedPosts.length > 0) {
          return {
            posts: allPosts,
            profile: profile || ({} as Profile),
            sortedPosts,
            getPost: (rkey: string) => allPosts!.get(rkey) ?? null,
            getAdjacentPosts: (rkey: string) => {
              const idx = sortedPosts.findIndex(p => p.rkey === rkey);
              return {
                previous: idx > 0 ? sortedPosts[idx - 1] : null,
                next: idx < sortedPosts.length - 1 ? sortedPosts[idx + 1] : null,
              };
            },
          };
        }
      }
      throw error;
    }
  } catch (err) {
    console.error("Error in loadAllPosts:", err);
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
 * Returns the most recent blog posts (for home page, etc.)
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
 * Clears cached profile and posts
 */
export function clearCache(): void {
  profile = undefined as any;
  allPosts = undefined as any;
  sortedPosts = [];
}
