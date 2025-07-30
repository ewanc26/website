import { generateOgImage } from '$lib/server/ogImage';

export const GET = async () => {
  const pngBuffer = await generateOgImage({
    title: "Blog – Ewan's Corner",
    subtitle: 'Personal blog, coding, technology, and life',
  });
  return new Response(new Uint8Array(pngBuffer), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
