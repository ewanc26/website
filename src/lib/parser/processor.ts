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

export const createMarkdownProcessor = () => {
  return unified()
    .use(remarkParse, { fragment: true }) // Parse the MD
    .use(remarkGfm) // Parse GH specific MD
    .use(remarkRehype, { allowDangerousHtml: true }) // Convert to HTML
    .use(rehypeRaw) // Parse HTML that exists as raw text leftover from MD parse
    .use(rehypeUpgradeImage)
    .use(rehypeSanitize, customSchema as Schema) // Sanitize the HTML
    .use(rehypeStringify); // Stringify
};