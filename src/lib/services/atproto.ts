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
    // Profile data is public, can use the public API
    const response = await defaultAgent.getProfile({ actor: PUBLIC_ATPROTO_DID });
    const profile = response.data;

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
    console.error('Failed to fetch profile:', error);
    throw error;
  }
}

export async function fetchStatus(): Promise<StatusData | null> {
  const cacheKey = `status:${PUBLIC_ATPROTO_DID}`;
  const cached = cache.get<StatusData>(cacheKey);
  if (cached) return cached;

  try {
    const agent = await getPublicAgent();
    const response = await agent.com.atproto.repo.listRecords({
      repo: PUBLIC_ATPROTO_DID,
      collection: 'uk.ewancroft.now',
      limit: 1
    });

    if (response.data.records.length === 0) return null;

    const record = response.data.records[0];
    const data: StatusData = {
      text: (record.value as any).text,
      createdAt: (record.value as any).createdAt
    };

    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Failed to fetch status:', error);
    return null;
  }
}

export async function fetchSiteInfo(): Promise<SiteInfoData | null> {
  const cacheKey = `siteinfo:${PUBLIC_ATPROTO_DID}`;
  const cached = cache.get<SiteInfoData>(cacheKey);
  if (cached) return cached;

  try {
    const agent = await getPublicAgent();
    const response = await agent.com.atproto.repo.getRecord({
      repo: PUBLIC_ATPROTO_DID,
      collection: 'uk.ewancroft.site.info',
      rkey: 'self'
    });

    const data = response.data.value as SiteInfoData;
    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Failed to fetch site info:', error);
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
    const agent = await getPublicAgent();
    const response = await agent.com.atproto.repo.getRecord({
      repo: PUBLIC_ATPROTO_DID,
      collection: 'blue.linkat.board',
      rkey: 'self'
    });

    const value = response.data.value as any;
    
    // Validate the response has the expected structure
    if (!value || !Array.isArray(value.cards)) {
      return null;
    }

    const data: LinkData = {
      cards: value.cards
    };
    
    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Failed to fetch links:', error);
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

export async function fetchBlogPosts(): Promise<BlogPostsData> {
  const cacheKey = `blogposts:${PUBLIC_ATPROTO_DID}`;
  const cached = cache.get<BlogPostsData>(cacheKey);
  if (cached) return cached;

  const posts: BlogPost[] = [];

  try {
    const agent = await getPublicAgent();

    // Fetch Whitewind posts
    try {
      const whitewindResponse = await agent.com.atproto.repo.listRecords({
        repo: PUBLIC_ATPROTO_DID,
        collection: 'com.whtwnd.blog.entry',
        limit: 100
      });

      for (const record of whitewindResponse.data.records) {
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
      console.warn('Failed to fetch Whitewind posts:', error);
    }

    // Fetch Leaflet documents
    try {
      const leafletDocsResponse = await agent.com.atproto.repo.listRecords({
        repo: PUBLIC_ATPROTO_DID,
        collection: 'pub.leaflet.document',
        limit: 100
      });

      // First, get all publications to resolve base paths
      const publicationsMap = new Map<string, string>();
      try {
        const publicationsResponse = await agent.com.atproto.repo.listRecords({
          repo: PUBLIC_ATPROTO_DID,
          collection: 'pub.leaflet.publication',
          limit: 100
        });

        for (const pubRecord of publicationsResponse.data.records) {
          const pubValue = pubRecord.value as any;
          publicationsMap.set(pubRecord.uri, pubValue.base_path || '');
        }
      } catch (error) {
        console.warn('Failed to fetch Leaflet publications:', error);
      }

      for (const record of leafletDocsResponse.data.records) {
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
      console.warn('Failed to fetch Leaflet documents:', error);
    }

    // Sort by date (newest first) and take top 5
    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const topPosts = posts.slice(0, 5);

    const data: BlogPostsData = { posts: topPosts };
    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    return { posts: [] };
  }
}