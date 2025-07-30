import { generateOgImage } from '$lib/server/ogImage';

export const GET = async () => {
  const pngBuffer = await generateOgImage({
    title: 'Site Meta',
    subtitle: 'About this site, colophon, and technical details',
  });
  return new Response(new Uint8Array(pngBuffer), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
