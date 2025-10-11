import type { RequestHandler } from './$types';
import { TTLCache } from '$lib/utils/cache';

// Server-side cache (10 minutes)
const commitCache = new TTLCache<any>(600000);

export const GET: RequestHandler = async () => {
  // Check cache first
  const cached = commitCache.get();
  if (cached) {
    return new Response(JSON.stringify(cached), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=600'
      }
    });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const response = await fetch(
      'https://api.github.com/repos/ewanc26/website/commits/main',
      {
        signal: controller.signal,
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        }
      }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch' }), { 
        status: response.status 
      });
    }
    
    const data = await response.json();
    const result = {
      date: data.commit.author.date,
      url: data.html_url,
      hash: data.sha.substring(0, 7)
    };
    
    // Cache the result
    commitCache.set(result);
    
    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=600'
      }
    });
  } catch (error) {
    console.error('Last commit API error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { 
      status: 500 
    });
  }
};
