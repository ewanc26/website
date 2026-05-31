import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";

const processor = remark()
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeSanitize)
  .use(rehypeSlug)
  .use(rehypeStringify);

export async function renderMarkdown(markdown: string): Promise<string> {
  const result = await processor.process(markdown);
  return result.toString();
}
