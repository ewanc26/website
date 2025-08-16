import { getProfile } from "$components/profile/profile";
import type { Profile, Post, BlogServiceResult, LeafletDocument } from "$components/shared";
import { env } from "$env/dynamic/public";

// Configuration for your blog publication
const BLOG_PUBLICATION_RKEY = env.PUBLIC_BLOG_PUBLICATION_RKEY;

// Caching profile and post data
let profile: Profile | undefined;
let allPosts: Map<string, Post> | undefined;
let sortedPosts: Post[] = [];
let blogPublicationUri: string | undefined;

// Loading state management
let isLoading = false;
let lastLoadTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

/**
 * Get or create the blog publication AT-URI
 */
async function getBlogPublicationUri(fetch: typeof window.fetch): Promise<string> {
  if (blogPublicationUri) {
    return blogPublicationUri;
  }

  if (!profile) {
    throw new Error("Profile not loaded");
  }

  // Try to find existing publication
  const url = new URL(`${profile.pds}/xrpc/com.atproto.repo.listRecords`);
  url.searchParams.set("repo", profile.did);
  url.searchParams.set("collection", "pub.leaflet.publication");
  url.searchParams.set("limit", "10"); // Should be enough for most cases

  try {
    const res = await fetch(url.toString());
    if (res.ok) {
      const body = await res.json();
      
      if (body.records && body.records.length > 0) {
        // Look for a publication with the expected rkey
        const targetPub = body.records.find((record: any) => {
          const rkey = record.uri.split('/').pop();
          const pubName = record.value?.name;
          return rkey === BLOG_PUBLICATION_RKEY
        });

        if (targetPub) {
          blogPublicationUri = targetPub.uri;
          console.log(`Found blog publication: ${blogPublicationUri}`);
          return blogPublicationUri as string;
        }
      }
    }
  } catch (error) {
    console.warn("Could not fetch publications:", error);
  }

  // If no publication found, construct the expected URI
  blogPublicationUri = `at://${profile.did}/pub.leaflet.publication/${BLOG_PUBLICATION_RKEY}`;
  console.log(`Using expected blog publication URI: ${blogPublicationUri}`);
  
  return blogPublicationUri;
}

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
            const level = Math.max(1, Math.min(6, (block as any).level || 1));
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
              htmlContent += `<pre><code${language ? ` class="language-${escapeHtml(language)}"` : ''}>${escapeHtml(block.plaintext)}</code></pre>\n`;
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
            // For images, we'd need to handle the blob reference properly
            htmlContent += `<figure><img src="#" alt="${escapeHtml(alt)}" />${alt ? `<figcaption>${escapeHtml(alt)}</figcaption>` : ''}</figure>\n`;
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
            const postRef = (block as any).postRef;
            if (postRef?.uri) {
              htmlContent += `<div class="bsky-post-embed"><a href="https://bsky.app/profile/${postRef.uri.split('/')[2]}/post/${postRef.uri.split('/').pop()}" target="_blank" rel="noopener noreferrer">Bluesky Post</a></div>\n`;
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
  if (typeof window !== 'undefined' && document?.createElement) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  // Fallback for server-side
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validates and processes a single Leaflet document record
 */
function processLeafletRecord(data: any, expectedPublicationUri: string): Post | null {
  const matches = data["uri"].split("/");
  const rkey = matches[matches.length - 1];

  if (process.env.NODE_ENV === 'development') {
    console.log('=== Leaflet Record Debug Info ===');
    console.log('URI:', data["uri"]);
    console.log('Expected Publication:', expectedPublicationUri);
  }

  const record = data["value"] || data.value;

  if (!record) {
    console.warn(`No record value found for ${rkey}`);
    return null;
  }

  // Validate Leaflet document structure
  if (record.$type !== 'pub.leaflet.document') {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Skipping non-document record: ${record.$type}`);
    }
    return null;
  }

  // Filter by publication - this is the key change!
  if (record.publication !== expectedPublicationUri) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Skipping document from different publication: ${record.publication}`);
    }
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
 * Fetches all Leaflet document records for the blog publication using pagination
 */
async function loadAllLeafletPages(fetch: typeof window.fetch): Promise<any[]> {
  if (!profile) {
    throw new Error("Profile not loaded");
  }

  const expectedPublicationUri = await getBlogPublicationUri(fetch);
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

      // Filter records by publication before adding
      if (body.records && Array.isArray(body.records)) {
        const blogRecords = body.records.filter((record: any) => {
          const recordData = record.value || record;
          return recordData.publication === expectedPublicationUri;
        });
        allRecords = allRecords.concat(blogRecords);
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`Page ${pageCount + 1}: Found ${blogRecords.length}/${body.records.length} blog documents`);
        }
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

  console.log(`Total blog documents found: ${allRecords.length}`);
  return allRecords;
}

/**
 * Loads and processes all Leaflet documents for the blog publication
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

      // Get the expected publication URI
      const expectedPublicationUri = await getBlogPublicationUri(fetch);

      // Fetch fresh Leaflet documents (already filtered by publication)
      const records = await loadAllLeafletPages(fetch);

      allPosts = new Map();
      for (const data of records) {
        const processed = processLeafletRecord(data, expectedPublicationUri);
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
      
      console.log(`Loaded ${sortedPosts.length} blog posts from publication: ${expectedPublicationUri}`);
      
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
 * Returns the most recent Leaflet documents from the blog publication
 */
export async function getLatestPosts(fetch: typeof window.fetch, limit: number = 3): Promise<Post[]> {
  try {
    // If we have cached data that's recent enough, use it
    const now = Date.now();
    if (sortedPosts.length > 0 && (now - lastLoadTime) < CACHE_DURATION) {
      return sortedPosts.slice(0, limit);
    }

    // Load profile and get publication URI if not already loaded
    if (profile === undefined) {
      profile = await getProfile(fetch);
    }
    
    const expectedPublicationUri = await getBlogPublicationUri(fetch);

    // Fetch only the first page of records for latest posts
    const url = new URL(`${profile.pds}/xrpc/com.atproto.repo.listRecords`);
    url.searchParams.set("repo", profile.did);
    url.searchParams.set("collection", "pub.leaflet.document");
    url.searchParams.set("limit", String(Math.min(limit * 3, 15))); // Get more than needed to account for filtering

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
        // Process and sort records by date first, filtering by publication
        const validRecords = body.records
          .filter((record: any) => {
            const recordData = record.value || record;
            return recordData.publication === expectedPublicationUri;
          })
          .map((record: any) => processLeafletRecord(record, expectedPublicationUri))
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
  blogPublicationUri = undefined;
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