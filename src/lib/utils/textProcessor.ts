import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { unified } from "unified";
import type { Node } from "unist";

type TextNode = Node & { type: "text"; value: string };
type ParentNode = Node & { children: Node[] };

/**
 * Extracts plain text from markdown content and truncates it to a specified length.
 * @param markdown The markdown content to process.
 * @param maxLength The maximum length of the extracted text (default: 160).
 * @returns A promise that resolves to the extracted and truncated plain text.
 */
export async function extractTextFromMarkdown(
  markdown: string,
  maxLength: number = 160
): Promise<string> {
  // Process the markdown to get plain text
  const plainText = String(
    await unified()
      .use(remarkParse, { fragment: true })
      .use(remarkGfm)
      .use(() => (tree) => {
        // Simple transformer that visits all nodes and removes everything but text
        const visit = (node: Node): string => {
          if (node.type === "text") {
            const textNode = node as TextNode;
            return textNode.value;
          }
          if ("children" in node) {
            const parentNode = node as ParentNode;
            return parentNode.children.map(visit).filter(Boolean).join(" ");
          }
          return "";
        };

        // Replace tree with just text content
        return {
          type: "root",
          children: [{ type: "text", value: visit(tree) }],
        };
      })
      .use(remarkRehype)
      .use(rehypeStringify)
      .process(markdown)
  );

  // Clean up the text
  let cleaned = plainText.replace(/\s+/g, " ").trim();

  // Truncate to maxLength if necessary
  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength) + "...";
  }

  return cleaned;
}

/**
 * Calculates the word count of a given string.
 * @param text The input string.
 * @returns The number of words in the string.
 */
export function calculateWordCount(text: string): number {
  return text.split(/\s+/).filter((word) => word.length > 0).length;
}