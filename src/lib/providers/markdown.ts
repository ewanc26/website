import { marked } from "marked";
import DOMPurify from "dompurify";

// Configure marked options according to best practices
marked.setOptions({
  gfm: true, // Enable GitHub Flavored Markdown (tables, autolinks, strikethrough)
  breaks: true, // Convert \n in paragraphs to <br> (great for Sequoia micro-writing)
  async: false, // Keep parsing synchronous for instant UI updates
});

/**
 * Converts a raw Markdown string into sanitized, safe HTML.
 * Safe to use directly inside Svelte's {@html} tag.
 */
export function renderMarkdown(rawText: string | undefined | null): string {
  if (!rawText) return "";

  // 1. Convert Markdown to raw HTML string
  const rawHtml = marked.parse(rawText) as string;

  // 2. Sanitize HTML to prevent XSS vulnerability
  // If we are running on the server (SSR), DOMPurify needs a hook,
  // otherwise it can safely sanitize directly on the browser client.
  if (typeof window !== "undefined") {
    return DOMPurify.sanitize(rawHtml, {
      USE_PROFILES: { html: true }, // Allow standard structural HTML elements
      ALLOWED_TAGS: [
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "p",
        "br",
        "strong",
        "em",
        "code",
        "pre",
        "ul",
        "ol",
        "li",
        "a",
        "blockquote",
        "img",
        "table",
        "thead",
        "tbody",
        "tr",
        "th",
        "td",
      ],
      ALLOWED_ATTR: ["href", "src", "alt", "title", "target", "class"],
    });
  }

  // Fallback for SSR if you don't use 'jsdom' on the server;
  // It returns the markup directly, which will then be sanitized immediately upon hydration.
  return rawHtml;
}
