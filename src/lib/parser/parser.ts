import { extractTextFromMarkdown, calculateWordCount } from "$utils/textProcessor";
import { createMarkdownProcessor } from "./processor";
import type { Post, MarkdownPost } from "./types";

export async function parse(mdposts: Map<string, MarkdownPost>): Promise<Map<string, Post>> {
  const posts: Map<string, Post> = new Map();
  const processor = createMarkdownProcessor();

  for (const [rkey, post] of mdposts) {
    const parsedHtml = String(
      await processor.process(post.mdcontent)
    );

    // Ensure mdcontent is a string before processing
    const markdownContent = post.mdcontent || '';

    // Extract plain text for excerpt
    const excerpt = await extractTextFromMarkdown(markdownContent);

    // Calculate word count from markdown content
    const wordCount = calculateWordCount(markdownContent);

    posts.set(rkey, {
      title: post.title,
      rkey: post.rkey,
      createdAt: post.createdAt,
      content: parsedHtml,
      excerpt,
      wordCount,
    });
  }
  
  return posts;
}