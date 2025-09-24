import { generateOgImage, OgImageOptions } from '$lib/server/og';
import { dev } from '$app/environment';

export const GET = async ({ url }) => {
  const baseUrl = dev ? url.origin : 'https://ewancroft.uk';
  
  const pngBuffer = await generateOgImage({
    title: "Blog – Ewan's Corner",
    subtitle: 'Personal blog, coding, technology, and life',
  }, baseUrl);
  
  return new Response(new Uint8Array(pngBuffer), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};