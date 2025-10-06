import { loadFonts } from '$lib/server/og/fonts';
import { dev } from '$app/environment';

export const GET = async ({ request, url }) => {
  // Verify cron secret (optional but recommended)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const baseUrl = dev ? url.origin : 'https://ewancroft.uk';
  
  try {
    const startTime = Date.now();
    await loadFonts(baseUrl);
    const elapsedTime = Date.now() - startTime;
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Cache warmed via cron',
      elapsedTime: `${elapsedTime}ms`,
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Cron warmup failed:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
