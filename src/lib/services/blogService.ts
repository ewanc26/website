import { getProfile } from "$components/profile/profile";
import type { Profile, Post, BlogServiceResult } from "$components/shared";

// Leaflet document structure based on the lexicons
interface LeafletDocument {
  $type: "pub.leaflet.document";
  title: string;
  description?: string;
  publishedAt?: string;
  publication: string; // at-uri
  author: string; // at-identifier
  pages: Array<{
    $type: "pub.leaflet.pages.linearDocument";
    blocks?: Array<{
      block: {
        $type: string;
        plaintext?: string;
        facets?: Array<any>;
        [key: string]: any;
      };
      alignment?: string;
    }>;
  }>;
  postRef?: {
    uri: string;
    cid: string;
  };
}

// Caching profile and post data
let profile: Profile | undefined;
let allPosts: Map<string, Post> | undefined;
let sortedPosts: Post[] = [];

// Loading state management
let isLoading = false;
let lastLoadTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

/**
 * Converts Leaflet document blocks to HTML content
 */
function convertLeafletToHtml(pages: LeafletDocument['pages']): { content: string; excerpt: string; wordCount: number } {
  let htmlContent = '';
  let plainTextContent = '';
  
  for (const page of pages) {
    if (page.blocks) {
      for (const blockWrapper of page.blocks) {
        const block = blockWrapper.block;
        
        switch (block.$type) {
          case 'pub.leaflet.blocks.text':
            if (block.plaintext) {
              htmlContent += `<p>${escapeHtml(block.plaintext)}</p>\n`;
              plainTextContent += block.plaintext + ' ';
            }
            break;
            
          case 'pub.leaflet.blocks.header':
            const level = (block as any).level || 1;
            if (block.plaintext) {
              htmlContent += `<h${level}>${escapeHtml(block.plaintext)}</h${level}>\n`;
              plainTextContent += block.plaintext + ' ';
            }
            break;
            
          case 'pub.leaflet.blocks.blockquote':
            if (block.plaintext) {
              htmlContent += `<blockquote>${escapeHtml(block.plaintext)}</blockquote>\n`;
              plainTextContent += block.plaintext + ' ';
            }
            break;
            
          case 'pub.leaflet.blocks.code':
            const language = (block as any).language || '';
            if (block.plaintext) {
              htmlContent += `<pre><code${language ? ` class="language-${language}"` : ''}>${escapeHtml(block.plaintext)}</code></pre>\n`;
              plainTextContent += block.plaintext + ' ';
            }
            break;
            
          case 'pub.leaflet.blocks.unorderedList':
            const children = (block as any).children || [];
            if (children.length > 0) {
              htmlContent += '<ul>\n';
              for (const item of children) {
                if (item.content?.plaintext) {
                  htmlContent += `<li>${escapeHtml(item.content.plaintext)}</li>\n`;
                  plainTextContent += item.content.plaintext + ' ';
                }
              }
              htmlContent += '</ul>\n';
            }
            break;
            
          case 'pub.leaflet.blocks.image':
            const alt = (block as any).alt || '';
            const aspectRatio = (block as any).aspectRatio;
            // For now, we'll create a placeholder for images
            htmlContent += `<figure><img src="#" alt="${escapeHtml(alt)}" /><figcaption>${escapeHtml(alt)}</figcaption></figure>\n`;
            plainTextContent += alt + ' ';
            break;
            
          case 'pub.leaflet.blocks.horizontalRule':
            htmlContent += '<hr>\n';
            break;
            
          case 'pub.leaflet.blocks.math':
            const tex = (block as any).tex || '';
            htmlContent += `<div class="math">${escapeHtml(tex)}</div>\n`;
            plainTextContent += tex + ' ';
            break;
            
          case 'pub.leaflet.blocks.website':
            const src = (block as any).src || '';
            const title = (block as any).title || '';
            const description = (block as any).description || '';
            htmlContent += `<div class="website-embed"><a href="${escapeHtml(src)}" target="_blank" rel="noopener noreferrer">${escapeHtml(title || src)}</a>${description ? `<p>${escapeHtml(description)}</p>` : ''}</div>\n`;
            plainTextContent += `${title || src} ${description} `;
            break;
            
          case 'pub.leaflet.blocks.bskyPost':
            // Handle Bluesky post embeds
            const postRef = (block as any).postRef;
            if (postRef?.uri) {
              htmlContent += `<div class="bsky-post-embed"><a href="${escapeHtml(postRef.uri)}" target="_blank" rel="noopener noreferrer">Bluesky Post</a></div>\n`;
              plainTextContent += 'Bluesky Post ';
            }
            break;
            
          default:
            // Fallback for unknown block types
            if (block.plaintext) {
              htmlContent += `<div>${escapeHtml(block.plaintext)}</div>\n`;
              plainTextContent += block.plaintext + ' ';
            }
        }
      }
    }
  }
  
  // Calculate word count and create excerpt
  const words = plainTextContent.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  const excerpt = words.slice(0, 50).join(' ') + (words.length > 50 ? '...' : '');
  
  return {
    content: htmlContent.trim(),
    excerpt,
    wordCount
  };
}

/**
 * Simple HTML escape function
 */
function escapeHtml(text: string): string {
  const div = document?.createElement('div') || { textContent: '', innerHTML: '' };
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Validates and processes a single Leaflet document record
 */
function processLeafletRecord(data: any): Post | null {
  const matches = data["uri"].split("/");
  const rkey = matches[matches.length - 1];

  if (process.env.NODE_ENV === 'development') {
    console.log('=== Leaflet Record Debug Info ===');
    console.log('URI:', data["uri"]);
    console.log('Data structure keys:', Object.keys(data));
  }

  const record = data["value"] || data.value;

  if (!record) {
    console.warn(`No record value found for ${rkey}`, {
      dataKeys: Object.keys(data),
    });
    return null;
  }

  // Validate Leaflet document structure
  if (record.$type !== 'pub.leaflet.document') {
    console.warn(`Invalid document type for ${rkey}: ${record.$type}`);
    return null;
  }

  if (!matches || matches.length !== 5 || !record) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Document skipped due to validation failure:', {
        rkey,
        matchesLength: matches?.length,
        hasRecord: !!record,
        type: record?.$type,
      });
    }
    return null;
  }

  const title = record.title;
  const publishedAt = record.publishedAt;
  const pages = record.pages || [];

  if (!title) {
    console.warn(`Skipping document with missing title: ${rkey}`);
    return null;
  }

  if (!pages || pages.length === 0) {
    console.warn(`Skipping document with no pages: ${rkey}`);
    return null;
  }

  // Parse or fallback for publishedAt date
  let createdAtDate: Date;
  if (!publishedAt) {
    console.warn(`Document missing publishedAt, using current time: ${rkey}`);
    createdAtDate = new Date();
  } else {
    createdAtDate = new Date(publishedAt);
    if (isNaN(createdAtDate.getTime())) {
      console.warn(`Skipping document with invalid date: ${rkey}`, {
        rawPublishedAt: publishedAt,
      });
      return null;
    }
  }

  // Convert Leaflet blocks to HTML
  const { content, excerpt, wordCount } = convertLeafletToHtml(pages);

  return {
    title,
    createdAt: createdAtDate,
    content,
    excerpt,
    wordCount,
    rkey,
  };
}

/**
 * Fetches all Leaflet document records using pagination (cursor-based)
 */
async function loadAllLeafletPages(fetch: typeof window.fetch): Promise<any[]> {
  if (!profile) {
    throw new Error("Profile not loaded");
  }

  let allRecords: any[] = [];
  let cursor: string | undefined | null = undefined;
  let pageCount = 0;
  const MAX_PAGES = 10; // Prevent infinite loops

  do {
    // Construct request URL with optional cursor
    const url = new URL(`${profile.pds}/xrpc/com.atproto.repo.listRecords`);
    url.searchParams.set("repo", profile.did);
    url.searchParams.set("collection", "pub.leaflet.document");
    if (cursor) {
      url.searchParams.set("cursor", cursor);
    }

    // Add timeout to fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

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
 * Loads and processes all Leaflet documents, with pagination support
 */
export async function loadAllPosts(fetch: typeof window.fetch): Promise<BlogServiceResult> {
  // Check if we have fresh cached data
  const now = Date.now();
  if (allPosts && sortedPosts.length > 0 && (now - lastLoadTime) < CACHE_DURATION && profile) {
    console.log('Returning cached Leaflet documents');
    return {
      posts: allPosts,
      profile: profile,
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

  // Prevent concurrent loading
  if (isLoading) {
    console.log('Leaflet loading already in progress, waiting...');
    if (allPosts && sortedPosts.length > 0 && profile) {
      return {
        posts: allPosts,
        profile: profile,
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

  isLoading = true;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      // Load profile once
      if (profile === undefined) {
        profile = await getProfile(fetch);
      }

      // Fetch fresh Leaflet documents
      const records = await loadAllLeafletPages(fetch);

      allPosts = new Map();
      for (const data of records) {
        const processed = processLeafletRecord(data);
        if (processed) {
          allPosts.set(processed.rkey, processed);
        }
      }

      // Sort posts chronologically (newest first)
      sortedPosts = Array.from(allPosts.values()).sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );

      // Assign reverse post numbers
      const total = sortedPosts.length;
      sortedPosts.forEach((post, index) => {
        post.postNumber = total - index;
      });

      lastLoadTime = now;
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
        console.warn('Leaflet loading timed out, returning cached data if available');
        if (allPosts && sortedPosts.length > 0 && profile) {
          return {
            posts: allPosts,
            profile: profile,
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
    const fallbackProfile: Profile = profile || {
      avatar: '',
      banner: '',
      displayName: 'Error',
      did: '',
      handle: 'error',
      description: '',
      pds: '',
    };

    return {
      posts: allPosts || new Map(),
      profile: fallbackProfile,
      sortedPosts: sortedPosts || [],
      getPost: (rkey: string) => allPosts?.get(rkey) ?? null,
      getAdjacentPosts: () => ({ previous: null, next: null }),
    };
  } finally {
    isLoading = false;
  }
}

/**
 * Returns the most recent Leaflet documents (for home page, etc.)
 */
export async function getLatestPosts(fetch: typeof window.fetch, limit: number = 3): Promise<Post[]> {
  try {
    // If we have cached data that's recent enough, use it
    const now = Date.now();
    if (sortedPosts.length > 0 && (now - lastLoadTime) < CACHE_DURATION) {
      return sortedPosts.slice(0, limit);
    }

    // For latest posts, we can use a lighter approach
    if (profile === undefined) {
      profile = await getProfile(fetch);
    }

    // Fetch only the first page of records for latest posts
    const url = new URL(`${profile.pds}/xrpc/com.atproto.repo.listRecords`);
    url.searchParams.set("repo", profile.did);
    url.searchParams.set("collection", "pub.leaflet.document");
    url.searchParams.set("limit", String(Math.min(limit * 2, 10))); // Get a bit more than needed

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(url.toString(), { 
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch latest posts: ${res.status}`);
      }
      
      const body = await res.json();

      const posts: Post[] = [];
      
      if (body.records && Array.isArray(body.records)) {
        // Process and sort records by date first
        const validRecords = body.records
          .map((record: any) => processLeafletRecord(record))
          .filter((record: Post | null): record is Post => record !== null)
          .sort((a: Post, b: Post) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, limit); // Take only what we need

        posts.push(...validRecords);
      }

      return posts;

    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('Latest posts request timed out');
        // Return cached data if available
        if (sortedPosts.length > 0) {
          return sortedPosts.slice(0, limit);
        }
      }
      throw error;
    }

  } catch (error) {
    console.error("Error fetching latest posts:", error);
    // Return cached data if available, otherwise empty array
    if (sortedPosts.length > 0) {
      return sortedPosts.slice(0, limit);
    }
    return [];
  }
}

/**
 * Clears cached profile and posts
 */
export function clearCache(): void {
  profile = undefined;
  allPosts = undefined;
  sortedPosts = [];
  lastLoadTime = 0;
  isLoading = false;
}

/**
 * Preload essential data only (for critical path)
 */
export async function preloadEssentialData(fetch: typeof window.fetch): Promise<Profile | null> {
  try {
    if (profile === undefined) {
      profile = await getProfile(fetch);
    }
    return profile;
  } catch (error) {
    console.error("Error preloading essential data:", error);
    return null;
  }
}