import { loadAllPosts } from '$lib/services/blogService';
import { formatDate } from '$lib/utils/formatters';
import { generateOgImage } from '$lib/server/ogImage';
export const GET = async (event) => {
  const rkey = event.params.rkey;
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
  const date = post.createdAt ? new Date(post.createdAt) : new Date();
  const dateString = formatDate ? formatDate(date) : date.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
  const metaLine = `${readingTime} min read • ${wordCount} words`;
  const pngBuffer = await generateOgImage({
    title: post.title,
    subtitle: undefined,
    metaLine,
    extraMeta: [dateString],
    author: {
      name: profile.displayName,
      handle: profile.handle,
      avatar: profile.avatar,
    },
  });
  return new Response(new Uint8Array(pngBuffer), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
