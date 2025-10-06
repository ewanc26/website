import { loadFonts } from '$lib/server/og/fonts';
import { dev } from '$app/environment';

export const GET = async ({ url }) => {
  const baseUrl = dev ? url.origin : 'https://ewancroft.uk';
  
  try {
    const startTime = Date.now();
    await loadFonts(baseUrl);
    const elapsedTime = Date.now() - startTime;
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Fonts pre-loaded successfully',
      elapsedTime: `${elapsedTime}ms`
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Font warmup failed:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  }
};
