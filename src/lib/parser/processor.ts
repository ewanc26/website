import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeRaw from "rehype-raw";
import { unified } from "unified";
import { customSchema } from "./schema";
import { rehypeUpgradeImage } from "./plugins";
import type { Schema } from "./types";
import remarkBreaks from "remark-breaks";
import remarkEmoji from "remark-emoji";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

export const createMarkdownProcessor = () => {
  return unified()
    .use(remarkParse, { fragment: true })
    .use(remarkGfm)
    .use(remarkBreaks) // Support for hard line breaks
    .use(remarkEmoji) // Convert shortcodes like :heart: to emojis
    .use(remarkMath) // Parse math syntax
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeKatex) // Convert math to KaTeX HTML
    .use(rehypeHighlight, { detect: true }) // Syntax highlighting for code blocks
    .use(rehypeSlug) // Add IDs to headings
    .use(rehypeAutolinkHeadings) // Add links to headings
    .use(rehypeUpgradeImage)
    .use(rehypeSanitize, customSchema as Schema)
    .use(rehypeStringify);
};