import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeRaw from "rehype-raw";
import type { Schema } from "../../node_modules/rehype-sanitize/lib";
import { unified } from "unified";
import type { Node } from "unist";
import type { Root, Element } from "hast";
import type { Plugin } from "unified";

import type { Post, MarkdownPost } from "$components/shared";

// WhiteWind's own custom schema:
// https://github.com/whtwnd/whitewind-blog/blob/7eb8d4623eea617fd562b93d66a0e235323a2f9a/frontend/src/services/DocProvider.tsx#L122
const customSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    font: [...(defaultSchema.attributes?.font ?? []), "color"],
    blockquote: [
      ...(defaultSchema.attributes?.blockquote ?? []),
      // bluesky
      "className",
      "dataBlueskyUri",
      "dataBlueskyCid",
      // instagram
      "dataInstgrmCaptioned",
      "dataInstgrmPermalink",
      "dataInstgrmVersion",
    ],
    iframe: [
      "width",
      "height",
      "title",
      "frameborder",
      "allow",
      "referrerpolicy",
      "allowfullscreen",
      "style",
      "seamless",
      ["src", /https:\/\/(www.youtube.com|bandcamp.com)\/.*/],
    ],
    section: ["dataFootnotes", "className"],
  },
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    "font",
    "mark",
    "iframe",
    "section",
  ],
};

// Automatically enforce https on PDS images. Heavily inspired by WhiteWind's blob replacer:
// https://github.com/whtwnd/whitewind-blog/blob/7eb8d4623eea617fd562b93d66a0e235323a2f9a/frontend/src/services/DocProvider.tsx#L90
// In theory we could also use their cache, but I'd like to rely on their API as little as possible, opting to pull from the PDS instead.
const upgradeImage = (child: Node): void => {
  if (child.type !== "element") {
    return;
  }
  const elem = child as Element;
  if (elem.tagName === "img") {
    // Ensure https
    const src = elem.properties.src;
    if (src !== undefined && typeof src === "string") {
      elem.properties.src = src.replace(/http:\/\//, "https://");
    }
  }
  elem.children.forEach((child) => upgradeImage(child));
};

const rehypeUpgradeImage: Plugin<[], Root, Node> = () => {
  return (tree) => {
    tree.children.forEach((child) => upgradeImage(child));
  };
};

import { extractTextFromMarkdown, calculateWordCount } from "$utils/textProcessor";

export async function parse(mdposts: Map<string, MarkdownPost>) {
  const posts: Map<string, Post> = new Map();
  
  // Convert to array and sort by creation date to assign sequential post numbers
  const sortedPosts = Array.from(mdposts.entries()).sort((a, b) => 
    a[1].createdAt.getTime() - b[1].createdAt.getTime()
  );
  
  for (let i = 0; i < sortedPosts.length; i++) {
    const [rkey, post] = sortedPosts[i];
    const postNumber = i + 1; // Sequential numbering starting from 1
    const parsedHtml = String(
      await unified()
        .use(remarkParse, { fragment: true }) // Parse the MD
        .use(remarkGfm) // Parse GH specific MD
        .use(remarkRehype, { allowDangerousHtml: true }) // Convert to HTML
        .use(rehypeRaw) // Parse HTML that exists as raw text leftover from MD parse
        .use(rehypeUpgradeImage)
        .use(rehypeSanitize, customSchema as Schema) // Sanitize the HTML
        .use(rehypeStringify) // Stringify
        .process(post.mdcontent)
    );

    // Ensure mdcontent is a string before processing
    const markdownContent = post.mdcontent || '';

    // Extract plain text for excerpt
    const excerpt = await extractTextFromMarkdown(markdownContent);

    // Calculate word count from markdown content
    const wordCount = calculateWordCount(markdownContent);

    posts.set(rkey, {
      postNumber,
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