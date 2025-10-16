import { AtpAgent } from '@atproto/api';
import { PUBLIC_ATPROTO_DID } from '$env/static/public';

// --- Default fallback agent (for public Bluesky API calls) ---
const defaultAgent = new AtpAgent({ service: 'https://public.api.bsky.app' });

// --- Cache system ---
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class ATProtoCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}

const cache = new ATProtoCache();

// --- Slingshot-based identity resolver ---
interface ResolvedIdentity {
  did: string;
  pds: string;
}

/**
 * Resolves the PUBLIC_ATPROTO_DID to find its PDS endpoint using Slingshot.
 */
async function resolvePublicIdentity(): Promise<ResolvedIdentity> {
  const response = await fetch(
    `https://slingshot.microcosm.blue/xrpc/com.bad-example.identity.resolveMiniDoc?identifier=${encodeURIComponent(PUBLIC_ATPROTO_DID)}`
  );

  if (!response.ok) {
    throw new Error(`Failed to resolve identifier: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.did || !data.pds) {
    throw new Error('Invalid response from identity resolver');
  }

  return data;
}

// --- Dynamic agent creation using PUBLIC_ATPROTO_DID ---
let resolvedAgent: AtpAgent | null = null;
let pdsAgent: AtpAgent | null = null;

async function getPublicAgent(): Promise<AtpAgent> {
  if (resolvedAgent) return resolvedAgent;

  try {
    const resolved = await resolvePublicIdentity();
    resolvedAgent = new AtpAgent({ service: resolved.pds });
    return resolvedAgent;
  } catch (err) {
    console.error('Failed to resolve PUBLIC_ATPROTO_DID via Slingshot, falling back:', err);
    resolvedAgent = defaultAgent;
    return resolvedAgent;
  }
}

async function getPDSAgent(): Promise<AtpAgent> {
  if (pdsAgent) return pdsAgent;

  try {
    const resolved = await resolvePublicIdentity();
    pdsAgent = new AtpAgent({ service: resolved.pds });
    return pdsAgent;
  } catch (err) {
    console.error('Failed to resolve PDS for PUBLIC_ATPROTO_DID:', err);
    throw err;
  }
}

/**
 * Executes a function with automatic fallback from Bluesky public API to user's PDS
 * @param operation The operation to execute
 * @param usePDSFirst If true, tries PDS first before public API
 */
async function withFallback<T>(
  operation: (agent: AtpAgent) => Promise<T>,
  usePDSFirst = false
): Promise<T> {
  const agents = usePDSFirst 
    ? [getPDSAgent, () => Promise.resolve(defaultAgent)]
    : [() => Promise.resolve(defaultAgent), getPDSAgent];

  let lastError: any;

  for (const getAgent of agents) {
    try {
      const agent = await getAgent();
      return await operation(agent);
    } catch (error) {
      console.warn('Operation failed, trying next agent:', error);
      lastError = error;
    }
  }

  throw lastError;
}

// --- Interfaces ---
export interface ProfileData {
  did: string;
  handle: string;
  displayName?: string;
  description?: string;
  avatar?: string;
  banner?: string;
  followersCount?: number;
  followsCount?: number;
  postsCount?: number;
}

export interface StatusData {
  text: string;
  createdAt: string;
}

export interface Technology {
  name: string;
  url?: string;
  description?: string;
}

export interface License {
  name: string;
  url?: string;
}

export interface BasedOnItem {
  section?: string;
  name: string;
  url?: string;
  description?: string;
  type?: string;
}

export interface RelatedService {
  section?: string;
  name: string;
  url?: string;
  description?: string;
  relationship?: string;
}

export interface Repository {
  platform?: string;
  url: string;
  type?: string;
  description?: string;
}

export interface Credit {
  section?: string;
  name: string;
  type: string;
  url?: string;
  author?: string;
  license?: License;
  description?: string;
}

export interface SectionLicense {
  section?: string;
  name?: string;
  url?: string;
}

export interface SiteInfoData {
  technologyStack?: Technology[];
  privacyStatement?: string;
  openSourceInfo?: {
    description?: string;
    license?: License;
    basedOn?: BasedOnItem[];
    relatedServices?: RelatedService[];
    repositories?: Repository[];
  };
  credits?: Credit[];
  additionalInfo?: {
    websiteBirthYear?: number;
    purpose?: string;
    sectionLicense?: SectionLicense[];
  };
}

// --- Fetch functions (always use PUBLIC_ATPROTO_DID) ---

export async function fetchProfile(): Promise<ProfileData> {
  const cacheKey = `profile:${PUBLIC_ATPROTO_DID}`;
  const cached = cache.get<ProfileData>(cacheKey);
  if (cached) return cached;

  try {
    // Profile data is public, try Bluesky API first, then PDS
    const profile = await withFallback(async (agent) => {
      const response = await agent.getProfile({ actor: PUBLIC_ATPROTO_DID });
      return response.data;
    });

    const data: ProfileData = {
      did: profile.did,
      handle: profile.handle,
      displayName: profile.displayName,
      description: profile.description,
      avatar: profile.avatar,
      banner: profile.banner,
      followersCount: profile.followersCount,
      followsCount: profile.followsCount,
      postsCount: profile.postsCount
    };

    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Failed to fetch profile from all sources:', error);
    throw error;
  }
}

export async function fetchStatus(): Promise<StatusData | null> {
  const cacheKey = `status:${PUBLIC_ATPROTO_DID}`;
  const cached = cache.get<StatusData>(cacheKey);
  if (cached) return cached;

  try {
    // Custom collection, prefer PDS first
    const records = await withFallback(async (agent) => {
      const response = await agent.com.atproto.repo.listRecords({
        repo: PUBLIC_ATPROTO_DID,
        collection: 'uk.ewancroft.now',
        limit: 1
      });
      return response.data.records;
    }, true); // usePDSFirst = true

    if (records.length === 0) return null;

    const record = records[0];
    const data: StatusData = {
      text: (record.value as any).text,
      createdAt: (record.value as any).createdAt
    };

    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Failed to fetch status from all sources:', error);
    return null;
  }
}

export async function fetchSiteInfo(): Promise<SiteInfoData | null> {
  const cacheKey = `siteinfo:${PUBLIC_ATPROTO_DID}`;
  const cached = cache.get<SiteInfoData>(cacheKey);
  if (cached) return cached;

  try {
    // Custom collection, prefer PDS first
    const value = await withFallback(async (agent) => {
      const response = await agent.com.atproto.repo.getRecord({
        repo: PUBLIC_ATPROTO_DID,
        collection: 'uk.ewancroft.site.info',
        rkey: 'self'
      });
      return response.data.value;
    }, true); // usePDSFirst = true

    const data = value as SiteInfoData;
    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Failed to fetch site info from all sources:', error);
    return null;
  }
}

export interface LinkCard {
  url: string;
  text: string;
  emoji: string;
}

export interface LinkData {
  cards: LinkCard[];
}

export async function fetchLinks(): Promise<LinkData | null> {
  const cacheKey = `links:${PUBLIC_ATPROTO_DID}`;
  const cached = cache.get<LinkData>(cacheKey);
  if (cached) return cached;

  try {
    // Custom collection, prefer PDS first
    const value = await withFallback(async (agent) => {
      const response = await agent.com.atproto.repo.getRecord({
        repo: PUBLIC_ATPROTO_DID,
        collection: 'blue.linkat.board',
        rkey: 'self'
      });
      return response.data.value;
    }, true); // usePDSFirst = true

    // Validate the response has the expected structure
    if (!value || !Array.isArray((value as any).cards)) {
      return null;
    }

    const data: LinkData = {
      cards: (value as any).cards
    };
    
    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Failed to fetch links from all sources:', error);
    return null;
  }
}

export interface BlogPost {
  title: string;
  url: string;
  createdAt: string;
  platform: 'whitewind' | 'leaflet';
  description?: string;
  rkey: string;
}

export interface BlogPostsData {
  posts: BlogPost[];
}

export interface BlueskyPost {
  text: string;
  createdAt: string;
  uri: string;
  likeCount?: number;
  repostCount?: number;
  replyCount?: number;
  hasImages: boolean;
  imageUrls?: string[];
  quotedPost?: {
    text: string;
    author: {
      displayName?: string;
      handle: string;
      avatar?: string;
    };
    createdAt: string;
    hasImages: boolean;
    imageUrls?: string[];
  };
}

export async function fetchLatestBlueskyPost(): Promise<BlueskyPost | null> {
  const cacheKey = `blueskypost:${PUBLIC_ATPROTO_DID}`;
  const cached = cache.get<BlueskyPost>(cacheKey);
  if (cached) return cached;

  try {
    // Try PDS first for post records
    const records = await withFallback(async (agent) => {
      const response = await agent.com.atproto.repo.listRecords({
        repo: PUBLIC_ATPROTO_DID,
        collection: 'app.bsky.feed.post',
        limit: 10
      });
      return response.data.records;
    }, true); // usePDSFirst = true

    if (records.length === 0) return null;

    // Find first non-reply post
    const nonReplyPost = records.find(record => {
      const value = record.value as any;
      return !value.reply;
    });

    if (!nonReplyPost) return null;

    const record = nonReplyPost;
    const value = record.value as any;
    
    // Get post thread to fetch engagement metrics and processed images
    let likeCount, repostCount, replyCount;
    let imageUrls: string[] | undefined;
    let hasImages = false;
    let quotedPost: BlueskyPost['quotedPost'];
    
    // Try to get engagement data from Bluesky public API first
    try {
      const threadResponse = await defaultAgent.getPostThread({
        uri: record.uri,
        depth: 0
      });
      
      if (threadResponse.data.thread && 'post' in threadResponse.data.thread) {
        const postData = threadResponse.data.thread.post;
        likeCount = postData.likeCount;
        repostCount = postData.repostCount;
        replyCount = postData.replyCount;
        
        // Extract images from the embed
        if (postData.embed && '$type' in postData.embed) {
          if (postData.embed.$type === 'app.bsky.embed.images#view' && 'images' in postData.embed) {
            hasImages = true;
            imageUrls = postData.embed.images.map((img: any) => img.thumb || img.fullsize);
          }
          // Handle quote posts
          else if (postData.embed.$type === 'app.bsky.embed.record#view' && 'record' in postData.embed) {
            const quotedRecord = postData.embed.record;
            if ('value' in quotedRecord && 'author' in quotedRecord) {
              quotedPost = {
                text: (quotedRecord.value as any).text || '',
                author: {
                  displayName: quotedRecord.author.displayName,
                  handle: quotedRecord.author.handle,
                  avatar: quotedRecord.author.avatar
                },
                createdAt: (quotedRecord.value as any).createdAt || '',
                hasImages: false,
                imageUrls: undefined
              };
            }
          }
          // Handle quote posts with images (recordWithMedia)
          else if (postData.embed.$type === 'app.bsky.embed.recordWithMedia#view') {
            // Extract main post images
            if ('media' in postData.embed && postData.embed.media.$type === 'app.bsky.embed.images#view') {
              hasImages = true;
              imageUrls = postData.embed.media.images.map((img: any) => img.thumb || img.fullsize);
            }
            // Extract quoted post
            if ('record' in postData.embed && 'record' in postData.embed.record) {
              const quotedRecord = postData.embed.record.record;
              if ('value' in quotedRecord && 'author' in quotedRecord) {
                let quotedImages: string[] | undefined;
                let quotedHasImages = false;
                
                // Check if quoted post has images
                if ('embeds' in quotedRecord && Array.isArray(quotedRecord.embeds)) {
                  const imageEmbed = quotedRecord.embeds.find((e: any) => e.$type === 'app.bsky.embed.images#view');
                  if (imageEmbed && 'images' in imageEmbed) {
                    quotedHasImages = true;
                    quotedImages = imageEmbed.images.map((img: any) => img.thumb || img.fullsize);
                  }
                }
                
                quotedPost = {
                  text: (quotedRecord.value as any).text || '',
                  author: {
                    displayName: quotedRecord.author.displayName,
                    handle: quotedRecord.author.handle,
                    avatar: quotedRecord.author.avatar
                  },
                  createdAt: (quotedRecord.value as any).createdAt || '',
                  hasImages: quotedHasImages,
                  imageUrls: quotedImages
                };
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('Failed to fetch post thread data from Bluesky API:', err);
    }
    
    // Fallback: load blobs directly from the user's PDS
    if (!imageUrls && value.embed?.images?.length > 0) {
      hasImages = true;
      try {
        const resolved = await resolvePublicIdentity();
        imageUrls = value.embed.images.map((img: any) => {
          const blobRef = img.image?.ref?.$link;
          if (blobRef) {
            // Construct direct PDS blob URL
            return `${resolved.pds}/xrpc/com.atproto.sync.getBlob?did=${PUBLIC_ATPROTO_DID}&cid=${blobRef}`;
          }
          return null;
        }).filter((url: string | null) => url !== null);
      } catch (resolveErr) {
        console.warn('Failed to resolve PDS for blob fallback:', resolveErr);
        imageUrls = [];
      }
    }

    const data: BlueskyPost = {
      text: value.text,
      createdAt: value.createdAt,
      uri: record.uri,
      likeCount,
      repostCount,
      replyCount,
      hasImages,
      imageUrls,
      quotedPost
    };

    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Failed to fetch latest Bluesky post from all sources:', error);
    return null;
  }
}

export async function fetchBlogPosts(): Promise<BlogPostsData> {
  const cacheKey = `blogposts:${PUBLIC_ATPROTO_DID}`;
  const cached = cache.get<BlogPostsData>(cacheKey);
  if (cached) return cached;

  const posts: BlogPost[] = [];

  try {
    // Fetch Whitewind posts with fallback
    try {
      const whitewindRecords = await withFallback(async (agent) => {
        const response = await agent.com.atproto.repo.listRecords({
          repo: PUBLIC_ATPROTO_DID,
          collection: 'com.whtwnd.blog.entry',
          limit: 100
        });
        return response.data.records;
      }, true); // usePDSFirst = true

      for (const record of whitewindRecords) {
        const value = record.value as any;
        // Skip drafts and non-public posts
        if (value.isDraft || (value.visibility && value.visibility !== 'public')) {
          continue;
        }
        
        posts.push({
          title: value.title || 'Untitled Post',
          url: `https://whtwnd.com/${PUBLIC_ATPROTO_DID}/${record.uri.split('/').pop()}`,
          createdAt: value.createdAt || record.value.createdAt || new Date().toISOString(),
          platform: 'whitewind',
          description: value.subtitle,
          rkey: record.uri.split('/').pop() || ''
        });
      }
    } catch (error) {
      console.warn('Failed to fetch Whitewind posts from all sources:', error);
    }

    // Fetch Leaflet documents with fallback
    try {
      const leafletDocsRecords = await withFallback(async (agent) => {
        const response = await agent.com.atproto.repo.listRecords({
          repo: PUBLIC_ATPROTO_DID,
          collection: 'pub.leaflet.document',
          limit: 100
        });
        return response.data.records;
      }, true); // usePDSFirst = true

      // First, get all publications to resolve base paths
      const publicationsMap = new Map<string, string>();
      try {
        const publicationsRecords = await withFallback(async (agent) => {
          const response = await agent.com.atproto.repo.listRecords({
            repo: PUBLIC_ATPROTO_DID,
            collection: 'pub.leaflet.publication',
            limit: 100
          });
          return response.data.records;
        }, true); // usePDSFirst = true

        for (const pubRecord of publicationsRecords) {
          const pubValue = pubRecord.value as any;
          publicationsMap.set(pubRecord.uri, pubValue.base_path || '');
        }
      } catch (error) {
        console.warn('Failed to fetch Leaflet publications from all sources:', error);
      }

      for (const record of leafletDocsRecords) {
        const value = record.value as any;
        const rkey = record.uri.split('/').pop() || '';
        const basePath = publicationsMap.get(value.publication) || '';
        
        posts.push({
          title: value.title || 'Untitled Document',
          url: basePath ? `${basePath}/${rkey}` : `https://leaflet.pub/${PUBLIC_ATPROTO_DID}/${rkey}`,
          createdAt: value.publishedAt || new Date().toISOString(),
          platform: 'leaflet',
          description: value.description,
          rkey
        });
      }
    } catch (error) {
      console.warn('Failed to fetch Leaflet documents from all sources:', error);
    }

    // Sort by date (newest first) and take top 5
    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const topPosts = posts.slice(0, 5);

    const data: BlogPostsData = { posts: topPosts };
    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Failed to fetch blog posts from all sources:', error);
    return { posts: [] };
  }
}