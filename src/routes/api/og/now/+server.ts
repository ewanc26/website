import { generateOgImage } from '$lib/server/ogImage';

export const GET = async () => {
  const pngBuffer = await generateOgImage({
    title: 'What I’m Doing Now',
    subtitle: 'My current focus, projects, and life updates',
  });
  return new Response(new Uint8Array(pngBuffer), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
