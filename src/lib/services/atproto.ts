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

// Helper: build a direct blob URL for a PDS
function buildPdsBlobUrl(pds: string, did: string, cid: string) {
  return `${pds.replace(/\/$/, '')}/xrpc/com.atproto.sync.getBlob?did=${encodeURIComponent(did)}&cid=${encodeURIComponent(cid)}`;
}

// Helper: robustly pull a CID / blob reference from various image/video shapes
function extractCidFromImageObject(img: any): string | null {
  if (!img) return null;
  // Common shapes: img.image.ref.$link, img.ref.$link, img.cid
  if (img.image && img.image.ref && img.image.ref.$link) return img.image.ref.$link as string;
  if (img.ref && img.ref.$link) return img.ref.$link as string;
  if (img.cid) return img.cid as string;
  if (typeof img === 'string') return img; // sometimes it's just a cid string
  return null;
}

/**
 * Robust extractor: hunts through `value` shapes for images (and video blobs).
 * - returns up to `limit` URLs (built using `resolvedPds` when available)
 * - supports value.embed (images, recordWithMedia, record), value.embeds arrays,
 *   and nested structures.
 * - also detects 'app.bsky.embed.video' shapes and returns the video blob URL first
 */
function extractImageUrlsFromValue(value: any, resolvedPds: ResolvedIdentity | null, defaultDid: string, limit = 4): string[] {
  const urls: string[] = [];

  try {
    const embed = (value as any)?.embed ?? null;

    if (embed) {
      // images view
      if (embed.$type === 'app.bsky.embed.images#view' && Array.isArray(embed.images)) {
        for (const img of embed.images) {
          const cid = extractCidFromImageObject(img);
          if (cid && resolvedPds) urls.push(buildPdsBlobUrl(resolvedPds.pds, defaultDid, cid));
          if (urls.length >= limit) return urls;
        }
      }

      // video embed (push video blob URL if available)
      if (embed.$type === 'app.bsky.embed.video#view' || embed.$type === 'app.bsky.embed.video') {
        const videoCid =
          (embed as any)?.jobStatus?.blob ??
          (embed as any)?.video?.ref?.$link ??
          (embed as any)?.video?.cid ??
          null;
        if (videoCid && resolvedPds) {
          urls.push(buildPdsBlobUrl(resolvedPds.pds, defaultDid, videoCid));
          if (urls.length >= limit) return urls;
        }
      }

      // recordWithMedia with embedded media.images
      if (embed.$type === 'app.bsky.embed.recordWithMedia#view') {
        const media = embed.media;
        if (media && media.$type === 'app.bsky.embed.images#view' && Array.isArray(media.images)) {
          for (const img of media.images) {
            const cid = extractCidFromImageObject(img);
            if (cid && resolvedPds) urls.push(buildPdsBlobUrl(resolvedPds.pds, defaultDid, cid));
            if (urls.length >= limit) return urls;
          }
        }

        // The quoted record itself may contain images in record.value or embeds
        const quotedRecord = embed.record;
        if (quotedRecord) {
          const quotedValue = quotedRecord.value ?? quotedRecord.record?.value ?? null;
          if (quotedValue) {
            const nested = extractImageUrlsFromValue(quotedValue, resolvedPds, defaultDid, limit - urls.length);
            urls.push(...nested);
            if (urls.length >= limit) return urls;
          }
        }
      }

      // record#view where embed.record may contain value or embeds
      if (embed.$type === 'app.bsky.embed.record#view' && embed.record) {
        const quoted = embed.record;
        const quotedValue = quoted.value ?? quoted.record?.value ?? null;
        if (quotedValue) {
          const nested = extractImageUrlsFromValue(quotedValue, resolvedPds, defaultDid, limit - urls.length);
          urls.push(...nested);
          if (urls.length >= limit) return urls;
        }
      }
    }

    // embeds array (older/newer shapes can place embeds here)
    if (Array.isArray((value as any).embeds)) {
      for (const e of (value as any).embeds) {
        if (e.$type === 'app.bsky.embed.images#view' && Array.isArray(e.images)) {
          for (const img of e.images) {
            const cid = extractCidFromImageObject(img);
            if (cid && resolvedPds) urls.push(buildPdsBlobUrl(resolvedPds.pds, defaultDid, cid));
            if (urls.length >= limit) return urls;
          }
        }

        if (e.$type === 'app.bsky.embed.video#view' || e.$type === 'app.bsky.embed.video') {
          const videoCid = (e as any)?.jobStatus?.blob ?? (e as any)?.video?.ref?.$link ?? (e as any)?.video?.cid ?? null;
          if (videoCid && resolvedPds) {
            urls.push(buildPdsBlobUrl(resolvedPds.pds, defaultDid, videoCid));
            if (urls.length >= limit) return urls;
          }
        }

        if (e.$type === 'app.bsky.embed.recordWithMedia#view') {
          const media = e.media;
          if (media && media.$type === 'app.bsky.embed.images#view' && Array.isArray(media.images)) {
            for (const img of media.images) {
              const cid = extractCidFromImageObject(img);
              if (cid && resolvedPds) urls.push(buildPdsBlobUrl(resolvedPds.pds, defaultDid, cid));
              if (urls.length >= limit) return urls;
            }
          }

          const quotedRec = e.record ?? e.record?.record ?? null;
          const quotedValue = quotedRec?.value ?? null;
          if (quotedValue) {
            const nested = extractImageUrlsFromValue(quotedValue, resolvedPds, defaultDid, limit - urls.length);
            urls.push(...nested);
            if (urls.length >= limit) return urls;
          }
        }
      }
    }

    // (value as any).embed?.images shape
    if ((value as any)?.embed?.images && Array.isArray((value as any).embed.images)) {
      for (const img of (value as any).embed.images) {
        const cid = extractCidFromImageObject(img);
        if (cid && resolvedPds) urls.push(buildPdsBlobUrl(resolvedPds.pds, defaultDid, cid));
        if (urls.length >= limit) return urls;
      }
    }

    // deep search fallback for any 'images' arrays or cid-like strings
    const stack = [value];
    while (stack.length && urls.length < limit) {
      const node = stack.pop();
      if (!node || typeof node !== 'object') continue;
      if (Array.isArray(node.images)) {
        for (const img of node.images) {
          const cid = extractCidFromImageObject(img);
          if (cid && resolvedPds) {
            urls.push(buildPdsBlobUrl(resolvedPds.pds, defaultDid, cid));
            if (urls.length >= limit) break;
          }
        }
      }
      for (const k of Object.keys(node)) {
        const v = node[k];
        if (v && typeof v === 'object') stack.push(v);
      }
    }
  } catch (err) {
    // be conservative: if anything goes wrong here, just return what we have
    console.warn('Error extracting image/video URLs from value:', err);
  }

  return urls.slice(0, limit);
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
  name?: string;
  url?: string;
  description?: string;
  type?: string;
}

export interface RelatedService {
  section?: string;
  name?: string;
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
  name?: string;
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

export interface Facet {
  index: {
    byteStart: number;
    byteEnd: number;
  };
  features: Array<{
    $type: string;
    uri?: string;
    did?: string;
    tag?: string;
  }>;
}

export interface ExternalLink {
  uri: string;
  title: string;
  description?: string;
  thumb?: string;
}

export interface PostAuthor {
  did: string;
  handle: string;
  displayName?: string;
  avatar?: string;
}

export interface BlueskyPost {
  text: string;
  createdAt: string;
  uri: string;
  author: PostAuthor;
  likeCount?: number;
  repostCount?: number;
  replyCount?: number;
  hasImages: boolean;
  imageUrls?: string[];
  imageAlts?: string[];
  hasVideo?: boolean;
  videoUrl?: string;
  videoThumbnail?: string;
  quotedPostUri?: string;
  quotedPost?: BlueskyPost;
  facets?: Facet[];
  externalLink?: ExternalLink;
}

export async function fetchLatestBlueskyPost(): Promise<BlueskyPost | null> {
  console.log('[fetchLatestBlueskyPost] Starting fetch...');
  const cacheKey = `blueskypost:latest:${PUBLIC_ATPROTO_DID}`;
  const cached = cache.get<BlueskyPost>(cacheKey);
  if (cached) {
    console.log('[fetchLatestBlueskyPost] Returning cached post');
    return cached;
  }

  try {
    console.log('[fetchLatestBlueskyPost] Fetching records from repo...');
    const records = await withFallback(async (agent) => {
      const response = await agent.com.atproto.repo.listRecords({
        repo: PUBLIC_ATPROTO_DID,
        collection: 'app.bsky.feed.post',
        limit: 10
      });
      return response.data.records;
    }, true);

    console.log('[fetchLatestBlueskyPost] Records fetched:', records.length);

    if (records.length === 0) {
      console.warn('[fetchLatestBlueskyPost] No records found');
      return null;
    }

    const nonReplyPost = records.find(record => {
      const value = record.value as any;
      return !value.reply;
    });

    if (!nonReplyPost) {
      console.warn('[fetchLatestBlueskyPost] No non-reply post found');
      return null;
    }

    console.log('[fetchLatestBlueskyPost] Found non-reply post:', nonReplyPost.uri);
    const post = await fetchPostFromUri(nonReplyPost.uri, 0);
    
    if (!post) {
      console.warn('[fetchLatestBlueskyPost] fetchPostFromUri returned null');
      return null;
    }

    console.log('[fetchLatestBlueskyPost] Post fetched successfully, caching...');
    cache.set(cacheKey, post);
    return post;
  } catch (error) {
    console.error('[fetchLatestBlueskyPost] Failed to fetch latest Bluesky post:', error);
    return null;
  }
}

export async function fetchBlueskyPostByUri(uri: string): Promise<BlueskyPost | null> {
  const cacheKey = `blueskypost:${uri}`;
  const cached = cache.get<BlueskyPost>(cacheKey);
  if (cached) return cached;

  try {
    // Extract DID from URI: at://did:plc:xxx/app.bsky.feed.post/rkey
    const parts = uri.split('/');
    const did = parts[2];
    const rkey = parts[4];

    // Try to get post thread from Bluesky public API first
    let likeCount, repostCount, replyCount;
    let imageUrls: string[] | undefined;
    let hasImages = false;
    let hasVideo = false;
    let videoUrl: string | undefined;
    let quotedPostUri: string | undefined;
    let text = '';
    let createdAt = '';

    try {
      const threadResponse = await defaultAgent.getPostThread({
        uri: uri,
        depth: 0
      });

      if (threadResponse.data.thread && 'post' in threadResponse.data.thread) {
        const postData = threadResponse.data.thread.post;
        const postEmbed = (postData as any).embed ?? null;
        const record = (postData as any).record;
        
        text = record.text || '';
        createdAt = record.createdAt || new Date().toISOString();
        likeCount = postData.likeCount;
        repostCount = postData.repostCount;
        replyCount = postData.replyCount;

        let resolvedForThread: ResolvedIdentity | null = null;
        try {
          resolvedForThread = await resolvePublicIdentity();
        } catch (e) {
          // not fatal
        }

        const urlsFromPost = extractImageUrlsFromValue(postData as any, resolvedForThread, did, 4);
        if (urlsFromPost.length > 0) {
          hasImages = true;
          imageUrls = urlsFromPost;
        }

        // Detect video
        const videoCid = (postEmbed as any)?.jobStatus?.blob ?? (postEmbed as any)?.video?.ref?.$link ?? (postEmbed as any)?.video?.cid ?? null;
        if (videoCid && resolvedForThread) {
          try {
            const vurl = buildPdsBlobUrl(resolvedForThread.pds, did, videoCid);
            hasVideo = true;
            videoUrl = vurl;
            imageUrls = imageUrls ? [vurl, ...imageUrls] : [vurl];
          } catch (e) {
            console.warn('Failed to resolve PDS for post video blob:', e);
          }
        }

        // Extract quoted post URI if present
        if (postEmbed && (postEmbed.$type === 'app.bsky.embed.record#view' || postEmbed.$type === 'app.bsky.embed.recordWithMedia#view')) {
          const quotedRecord = postEmbed.$type === 'app.bsky.embed.recordWithMedia#view' ? postEmbed.record : postEmbed.record;
          if (quotedRecord && 'uri' in quotedRecord) {
            quotedPostUri = quotedRecord.uri;
          }
        }
      }
    } catch (err) {
      console.warn('Failed to fetch post thread from Bluesky API:', err);
      // Fall back to PDS
      try {
        const records = await withFallback(async (agent) => {
          const response = await agent.com.atproto.repo.getRecord({
            repo: did,
            collection: 'app.bsky.feed.post',
            rkey: rkey
          });
          return response.data;
        }, true);

        const value = records.value as any;
        text = value.text || '';
        createdAt = value.createdAt || new Date().toISOString();

        // Check for images
        if (value.embed?.images?.length > 0) {
          hasImages = true;
          try {
            const resolved = await resolvePublicIdentity();
            imageUrls = value.embed.images.map((img: any) => {
              const blobRef = img.image?.ref?.$link ?? img.ref?.$link ?? img.cid;
              if (blobRef) {
                return buildPdsBlobUrl(resolved.pds, did, blobRef);
              }
              return null;
            }).filter((url: string | null) => url !== null).slice(0, 4) as string[];
          } catch (resolveErr) {
            console.warn('Failed to resolve PDS for blob fallback:', resolveErr);
            imageUrls = [];
          }
        }

        // Extract quoted post URI from record
        if (value.embed?.record) {
          const quotedUri = value.embed.record.uri ?? value.embed.record.record?.uri ?? null;
          if (quotedUri) {
            quotedPostUri = quotedUri;
          }
        }
      } catch (fallbackErr) {
        console.error('Failed to fetch post from PDS:', fallbackErr);
        return null;
      }
    }

    const data: BlueskyPost = {
      text,
      createdAt,
      uri,
      likeCount,
      repostCount,
      replyCount,
      hasImages,
      imageUrls,
      hasVideo,
      videoUrl,
      quotedPostUri
    };

    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Failed to fetch Bluesky post:', error);
    return null;
  }
}

// Recursive fetch for quoted posts, up to 2 levels deep
async function fetchPostFromUri(uri: string, depth: number): Promise<BlueskyPost | null> {
  console.log(`[fetchPostFromUri] Starting fetch at depth ${depth} for URI:`, uri);
  
  if (depth >= 2) {
    console.log(`[fetchPostFromUri] Max depth reached (${depth}), stopping recursion`);
    return null;
  }

  try {
    console.log(`[fetchPostFromUri] Fetching post thread from Bluesky API...`);
    const threadResponse = await defaultAgent.getPostThread({ uri, depth: 0 });

    if (!threadResponse.data.thread || !('post' in threadResponse.data.thread)) {
      console.warn(`[fetchPostFromUri] No valid thread data found for URI:`, uri);
      return null;
    }

    const postData = threadResponse.data.thread.post;
    console.log(`[fetchPostFromUri] Post data received:`, {
      uri: postData.uri,
      author: postData.author.handle,
      hasEmbed: !!postData.embed,
      embedType: postData.embed?.$type
    });
    
    const value = postData.record as any;
    const embed = (postData as any).embed ?? null;

    // Extract author information
    const author: PostAuthor = {
      did: postData.author.did,
      handle: postData.author.handle,
      displayName: postData.author.displayName,
      avatar: postData.author.avatar
    };
    console.log(`[fetchPostFromUri] Author extracted:`, author);

    // Get the author's DID for blob resolution
    const authorDid = postData.author.did;

    let imageUrls: string[] | undefined;
    let imageAlts: string[] | undefined;
    let hasImages = false;
    let hasVideo = false;
    let videoUrl: string | undefined;
    let videoThumbnail: string | undefined;
    let quotedPost: BlueskyPost | undefined;
    let quotedPostUri: string | undefined;
    let externalLink: ExternalLink | undefined;

    // Extract facets from the record
    const facets: Facet[] | undefined = value.facets;
    console.log(`[fetchPostFromUri] Facets found:`, facets?.length || 0);

    // Resolve PDS for the author (not PUBLIC_ATPROTO_DID)
    let authorPds: string;
    try {
      console.log(`[fetchPostFromUri] Resolving PDS for author DID:`, authorDid);
      const resolveResponse = await fetch(
        `https://slingshot.microcosm.blue/xrpc/com.bad-example.identity.resolveMiniDoc?identifier=${encodeURIComponent(authorDid)}`
      );
      if (resolveResponse.ok) {
        const resolveData = await resolveResponse.json();
        authorPds = resolveData.pds;
        console.log(`[fetchPostFromUri] PDS resolved:`, authorPds);
      } else {
        // Fallback to public.api.bsky.app for blob serving
        authorPds = 'https://bsky.social';
        console.log(`[fetchPostFromUri] PDS resolution failed, using fallback:`, authorPds);
      }
    } catch (e) {
      console.warn('[fetchPostFromUri] Failed to resolve PDS for author, using fallback:', e);
      authorPds = 'https://bsky.social';
    }

    // Handle images
    if (embed?.$type === 'app.bsky.embed.images#view' && Array.isArray(embed.images)) {
      console.log(`[fetchPostFromUri] Processing images embed, count:`, embed.images.length);
      hasImages = true;
      imageUrls = [];
      imageAlts = [];
      for (const img of embed.images) {
        const cid = extractCidFromImageObject(img);
        console.log(`[fetchPostFromUri] Image CID extracted:`, cid);
        if (cid) {
          const blobUrl = buildPdsBlobUrl(authorPds, authorDid, cid);
          console.log(`[fetchPostFromUri] Built blob URL:`, blobUrl);
          imageUrls.push(blobUrl);
          imageAlts.push(img.alt || '');
        }
      }
      console.log(`[fetchPostFromUri] Final image URLs:`, imageUrls);
    }

    // Handle video
    if (embed?.$type === 'app.bsky.embed.video#view') {
      console.log(`[fetchPostFromUri] Processing video embed`);
      const videoCid = embed.video?.ref?.$link ?? embed.video?.cid ?? null;
      console.log(`[fetchPostFromUri] Video CID:`, videoCid);
      if (videoCid) {
        hasVideo = true;
        videoUrl = buildPdsBlobUrl(authorPds, authorDid, videoCid);
        console.log(`[fetchPostFromUri] Video URL:`, videoUrl);
      }
      // Extract video thumbnail if available
      const thumbnailCid = embed.thumbnail?.ref?.$link ?? embed.thumbnail?.cid ?? null;
      if (thumbnailCid) {
        videoThumbnail = buildPdsBlobUrl(authorPds, authorDid, thumbnailCid);
        console.log(`[fetchPostFromUri] Video thumbnail URL:`, videoThumbnail);
      }
    }

    // Handle external link card
    if (embed?.$type === 'app.bsky.embed.external#view') {
      console.log(`[fetchPostFromUri] Processing external link embed`);
      const external = embed.external;
      if (external) {
        externalLink = {
          uri: external.uri,
          title: external.title,
          description: external.description
        };
        console.log(`[fetchPostFromUri] External link:`, externalLink.uri);
        // Extract thumbnail if available
        const thumbCid = external.thumb?.ref?.$link ?? external.thumb?.cid ?? null;
        if (thumbCid) {
          externalLink.thumb = buildPdsBlobUrl(authorPds, authorDid, thumbCid);
          console.log(`[fetchPostFromUri] External link thumbnail:`, externalLink.thumb);
        }
      }
    }

    // Handle recordWithMedia (quoted post with media)
    if (embed?.$type === 'app.bsky.embed.recordWithMedia#view') {
      console.log(`[fetchPostFromUri] Processing recordWithMedia embed`);
      const media = embed.media;
      console.log(`[fetchPostFromUri] Media type:`, media?.$type);
      
      // Extract images from media
      if (media?.$type === 'app.bsky.embed.images#view' && Array.isArray(media.images)) {
        console.log(`[fetchPostFromUri] Processing images in recordWithMedia, count:`, media.images.length);
        hasImages = true;
        imageUrls = [];
        imageAlts = [];
        for (const img of media.images) {
          const cid = extractCidFromImageObject(img);
          console.log(`[fetchPostFromUri] Media image CID:`, cid);
          if (cid) {
            const blobUrl = buildPdsBlobUrl(authorPds, authorDid, cid);
            console.log(`[fetchPostFromUri] Media image blob URL:`, blobUrl);
            imageUrls.push(blobUrl);
            imageAlts.push(img.alt || '');
          }
        }
        console.log(`[fetchPostFromUri] Final media image URLs:`, imageUrls);
      }

      // Extract video from media
      if (media?.$type === 'app.bsky.embed.video#view') {
        console.log(`[fetchPostFromUri] Processing video in recordWithMedia`);
        const videoCid = media.video?.ref?.$link ?? media.video?.cid ?? null;
        console.log(`[fetchPostFromUri] Media video CID:`, videoCid);
        if (videoCid) {
          hasVideo = true;
          videoUrl = buildPdsBlobUrl(authorPds, authorDid, videoCid);
          console.log(`[fetchPostFromUri] Media video URL:`, videoUrl);
        }
        const thumbnailCid = media.thumbnail?.ref?.$link ?? media.thumbnail?.cid ?? null;
        if (thumbnailCid) {
          videoThumbnail = buildPdsBlobUrl(authorPds, authorDid, thumbnailCid);
          console.log(`[fetchPostFromUri] Media video thumbnail:`, videoThumbnail);
        }
      }

      // Extract external link from media
      if (media?.$type === 'app.bsky.embed.external#view') {
        console.log(`[fetchPostFromUri] Processing external link in recordWithMedia`);
        const external = media.external;
        if (external) {
          externalLink = {
            uri: external.uri,
            title: external.title,
            description: external.description
          };
          console.log(`[fetchPostFromUri] Media external link:`, externalLink.uri);
          const thumbCid = external.thumb?.ref?.$link ?? external.thumb?.cid ?? null;
          if (thumbCid) {
            externalLink.thumb = buildPdsBlobUrl(authorPds, authorDid, thumbCid);
            console.log(`[fetchPostFromUri] Media external thumbnail:`, externalLink.thumb);
          }
        }
      }

      // Extract quoted record
      const quotedRecord = embed.record;
      console.log(`[fetchPostFromUri] Quoted record in recordWithMedia:`, quotedRecord?.uri);
      if (quotedRecord && typeof quotedRecord.uri === 'string') {
        quotedPostUri = quotedRecord.uri;
        console.log(`[fetchPostFromUri] Recursively fetching quoted post at depth ${depth + 1}:`, quotedPostUri);
        if (quotedPostUri) {
          quotedPost = await fetchPostFromUri(quotedPostUri, depth + 1) ?? undefined;
          console.log(`[fetchPostFromUri] Quoted post fetched:`, quotedPost ? 'success' : 'failed');
        }
      }
    }

    // Handle simple quoted post (without media)
    if (embed?.$type === 'app.bsky.embed.record#view') {
      console.log(`[fetchPostFromUri] Processing simple record embed (quoted post)`);
      const quotedRecord = embed.record;
      console.log(`[fetchPostFromUri] Quoted record:`, quotedRecord?.uri);
      if (quotedRecord && typeof quotedRecord.uri === 'string') {
        quotedPostUri = quotedRecord.uri;
        console.log(`[fetchPostFromUri] Recursively fetching quoted post at depth ${depth + 1}:`, quotedPostUri);
        if (quotedPostUri) {
          quotedPost = await fetchPostFromUri(quotedPostUri, depth + 1) ?? undefined;
          console.log(`[fetchPostFromUri] Quoted post fetched:`, quotedPost ? 'success' : 'failed');
        }
      }
    }

    const post: BlueskyPost = {
      text: value.text,
      createdAt: value.createdAt,
      uri: postData.uri,
      author,
      likeCount: postData.likeCount,
      repostCount: postData.repostCount,
      replyCount: postData.replyCount,
      hasImages,
      imageUrls,
      imageAlts,
      hasVideo,
      videoUrl,
      videoThumbnail,
      quotedPostUri,
      quotedPost,
      facets,
      externalLink
    };

    console.log(`[fetchPostFromUri] Post construction complete at depth ${depth}:`, {
      hasImages,
      imageCount: imageUrls?.length,
      hasVideo,
      hasQuotedPost: !!quotedPost,
      hasExternalLink: !!externalLink
    });

    return post;
  } catch (err) {
    console.error(`[fetchPostFromUri] Failed to fetch post at depth ${depth}:`, err);
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