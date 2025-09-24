// Go to http://localhost:5173/api/og/test.png to see the result.
// Note: In production, this would be at https://ewancroft.uk/api/og/test.png
// This is primarily for testing the OG image generation locally and in production. 
// Particularly since this is entirely dynamic and not based on any content.

import { generateOgImage, OgImageOptions } from '$lib/server/og';
import { dev } from '$app/environment';

// simple counter (module-level, persists across dev requests)
let counter = 0;

export const GET = async () => {
  if (!dev) {
    // In production, redirect to the index page
    return new Response(null, {
      status: 302,
      headers: { Location: '/' }
    });
  }

  const now = new Date();
  const dateCases = [
    now,                          // 0: direct Date object
    now.toISOString(),            // 1: ISO string
    now.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    }),                           // 2: preformatted string
  ];

  // Pick case by counter (cycles through 0,1,2,...)
  const caseIndex = counter % dateCases.length;
  const selectedCase = dateCases[caseIndex];
  counter++;

  const png = await generateOgImage({
    title: 'Test OG Image',
    subtitle: `This is a subtitle to check sizing and wrapping. [${caseIndex}]`,
    metaLine: '5 min read · 1200 words',
    author: {
      name: 'ewan',
      handle: 'ewancroft.uk',
      did: 'did:plc:ofrbh253gwicbkc5nktqepol',
      avatar: '', // force fallback
    },
    extraMeta: [selectedCase],
    banner: '', // force fallback
  });

  console.log(`OG Test: using case [${caseIndex}] ->`, selectedCase);

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'no-store',
    },
  });
};