import { loadAllPosts } from '$lib/services/blogService';
import { generateOgImage } from '$lib/server/og';
import type { OgImageOptions } from '$lib/server/og';
import { dev } from '$app/environment';

export const GET = async (event) => {
  const rkey = event.params.rkey;
  const baseUrl = dev ? event.url.origin : 'https://ewancroft.uk';
  
  if (!rkey) {
    return new Response('Missing rkey', { status: 400 });
  }
  
  const { getPost, profile } = await loadAllPosts(event.fetch);
  const post = getPost(rkey);
  
  if (!post) {
    return new Response('Post not found', { status: 404 });
  }
  
  const wordCount = post.wordCount || 0;
  const readingTime = Math.ceil(wordCount / 200);

  // just pass the raw createdAt as a Date or ISO string
  const createdAt = post.createdAt ? new Date(post.createdAt) : new Date();

  const metaLine = `${readingTime} min read • ${wordCount} words`;
  
  const pngBuffer = await generateOgImage({
    title: post.title,
    subtitle: undefined,
    metaLine,
    extraMeta: [createdAt.toDateString()],
    author: {
      name: profile.displayName,
      handle: profile.handle,
      avatar: profile.avatar,
    },
  }, baseUrl);
  
  return new Response(new Uint8Array(pngBuffer), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};