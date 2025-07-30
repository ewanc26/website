import { generateOgImage } from '$lib/server/ogImage';
import { dev } from '$app/environment';

export const GET = async ({ url }) => {
  const baseUrl = dev ? url.origin : 'https://ewancroft.uk';
  
  const pngBuffer = await generateOgImage({
    title: 'What I\'m Doing Now',
    subtitle: 'My current focus, projects, and life updates',
  }, baseUrl);
  
  return new Response(new Uint8Array(pngBuffer), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};