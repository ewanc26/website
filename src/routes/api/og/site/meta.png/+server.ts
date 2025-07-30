import { generateOgImage } from '$lib/server/ogImage';
import { dev } from '$app/environment';

export const GET = async ({ url }) => {
  const baseUrl = dev ? url.origin : 'https://ewancroft.uk';
  
  const pngBuffer = await generateOgImage({
    title: 'Site Meta',
    subtitle: 'About this site, colophon, and technical details',
  }, baseUrl);
  
  return new Response(new Uint8Array(pngBuffer), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};