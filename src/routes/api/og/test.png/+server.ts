// Go to http://localhost:5173/api/og/test.png to see the result.
// Note: In production, this would be at https://ewancroft.uk/api/og/test.png
// This is primarily for testing the OG image generation locally and in production. Particularly since this is entirely dynamic and not based on any content.

import { generateOgImage } from '$lib/server/ogImage';
import { dev } from '$app/environment';

export const GET = async () => {
  if (!dev) {
    // In production, redirect to the index page
    return new Response(null, {
      status: 302,
      headers: { Location: '/' }
    });
  }

  // Dev: generate test OG image
  const png = await generateOgImage({
    title: 'Test OG Image',
    subtitle: 'This is a subtitle to check sizing and wrapping.',
    metaLine: '5 min read · 1200 words',
    author: {
      name: 'ewan',
      handle: 'ewancroft.uk',
      did: 'did:plc:ofrbh253gwicbkc5nktqepol',
      avatar: '', // force fallback
    },
    extraMeta: [new Date().toISOString()],
    banner: '', // force fallback
  });

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'no-store',
    },
  });
};