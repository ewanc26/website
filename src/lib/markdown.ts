import { marked } from "marked";
import DOMPurify from "dompurify";

marked.setOptions({
  gfm: true,
  breaks: true,
  async: false,
});

export function renderMarkdown(rawText: string | undefined | null): string {
  if (!rawText) return "";
  const rawHtml = marked.parse(rawText) as string;

  if (typeof window !== "undefined") {
    return DOMPurify.sanitize(rawHtml, {
      USE_PROFILES: { html: true },
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
  return rawHtml;
}
