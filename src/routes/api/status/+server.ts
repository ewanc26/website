import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/public';
import { TTLCache } from '$lib/utils/cache';

// Server-side cache (5 minutes)
const statusCache = new TTLCache<any>(300000);

export const GET: RequestHandler = async ({ url, fetch }) => {
  const did = url.searchParams.get('did');
  const pds = url.searchParams.get('pds');
  
  // Check cache first
  const cacheKey = `${did}_status`;
  const cached = statusCache.get();
  if (cached) {
    return new Response(JSON.stringify(cached), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
      }
    });
  }

  const results: any = { status: null, music: null };
  
  // Parallel fetch of status and music
  await Promise.allSettled([
    // Fetch status
    (async () => {
      if (!did || !pds) return;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(
          `${pds}/xrpc/com.atproto.repo.listRecords?repo=${did}&collection=uk.ewancroft.now`,
          { signal: controller.signal }
        );
        
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error('Status fetch failed');
        
        const data = await response.json();
        if (data?.records?.length > 0) {
          const sorted = data.records.sort(
            (a: any, b: any) =>
              new Date(b.value.createdAt).getTime() -
              new Date(a.value.createdAt).getTime()
          );
          const latest = sorted[0].value;
          results.status = {
            text: latest.text.replace(/<[^>]*>?/gm, '').trim(),
            date: latest.createdAt
          };
        }
      } catch (error) {
        console.error('[Status API] Error fetching status:', error);
      }
    })(),
    
    // Fetch Last.fm
    (async () => {
      if (!env.PUBLIC_LASTFM_USERNAME) return;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const params = new URLSearchParams({
          username: env.PUBLIC_LASTFM_USERNAME,
          emoji: '🎧',
          nomoji: 'false'
        });
        
        const response = await fetch(
          `https://recentfm.rknight.me/now.php?${params.toString()}`,
          { signal: controller.signal }
        );
        
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error('Music fetch failed');
        
        const data = await response.json();
        if (data.content) {
          // Parse HTML on server
          const linkMatch = data.content.match(/href="([^"]+)">(.+?)<\/a>/);
          if (linkMatch) {
            const textMatch = linkMatch[2].match(/^(.+?) by (.+)$/);
            if (textMatch) {
              results.music = {
                name: textMatch[1].trim(),
                artist: textMatch[2].trim(),
                url: linkMatch[1]
              };
            }
          }
        }
      } catch (error) {
        console.error('[Status API] Error fetching music:', error);
      }
    })()
  ]);
  
  // Cache the results
  statusCache.set(results);
  
  return new Response(JSON.stringify(results), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300'
    }
  });
};
