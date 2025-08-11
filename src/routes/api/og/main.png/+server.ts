import { generateOgImage } from '$lib/server/ogImage';
import { dev } from '$app/environment';
import { createFileDebugger } from '$lib/utils/debug.js';

const debug = createFileDebugger('api/og/main.png/+server.ts');

export const GET = async ({ url }) => {
  debug.enter('GET', { 
    url: url.toString(),
    userAgent: url.searchParams.get('user-agent') || 'unknown',
    referer: url.searchParams.get('referer') || 'none'
  });
  
  const timer = debug.time('mainOgImageGeneration');
  
  try {
    debug.info('Processing main OG image request', {
      dev,
      urlOrigin: url.origin,
      baseUrl: dev ? url.origin : 'https://ewancroft.uk'
    });
    
    const baseUrl = dev ? url.origin : 'https://ewancroft.uk';
    
    debug.debug('Calling generateOgImage with main site options');
    const pngBuffer = await generateOgImage({
      title: "Ewan's Corner",
      subtitle: 'personal site, blog, and digital garden',
    }, baseUrl);
    
    debug.info('OG image generated successfully', {
      bufferLength: pngBuffer?.length,
      isBuffer: Buffer.isBuffer(pngBuffer),
      contentType: 'image/png'
    });
    
    const response = new Response(new Uint8Array(pngBuffer), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    });
    
    debug.debug('Response created successfully', {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    timer();
    debug.exit('GET', { 
      success: true, 
      responseStatus: response.status,
      bufferLength: pngBuffer?.length 
    });
    
    return response;
  } catch (error) {
    debug.errorWithContext('Failed to generate main OG image', error as Error, {
      function: 'GET',
      url: url.toString()
    });
    
    timer();
    debug.exit('GET', { 
      success: false, 
      error: error 
    });
    
    // Return an error response
    return new Response('Failed to generate OG image', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
};