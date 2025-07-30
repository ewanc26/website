import { generateOgImage } from '$lib/server/ogImage';

export const GET = async () => {
  const pngBuffer = await generateOgImage({
    title: "Ewan's Corner",
    subtitle: 'personal site, blog, and digital garden',
  });
  return new Response(new Uint8Array(pngBuffer), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
