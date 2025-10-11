import type { PageServerLoad } from './$types';
import { getLatestPosts } from '$lib/services/blogService';
import type { LinkBoard } from '$components/shared';

export const load: PageServerLoad = async ({ fetch, parent }) => {
  // Get parent data (profile from layout)
  const { profile } = await parent();
  
  return {
    // Get latest posts server-side
    latestPosts: await getLatestPosts(fetch, 3),
    
    // Stream non-critical data
    streamed: {
      links: fetchLinks(profile, fetch)
    }
  };
};

async function fetchLinks(profile: any, fetch: typeof globalThis.fetch): Promise<LinkBoard | null> {
  if (!profile?.pds || !profile?.did) return null;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const response = await fetch(
      `${profile.pds}/xrpc/com.atproto.repo.listRecords?repo=${profile.did}&collection=blue.linkat.board`,
      { signal: controller.signal }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.records?.[0]?.value || null;
  } catch (error) {
    console.error('Error fetching links:', error);
    return null;
  }
}
