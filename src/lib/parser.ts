import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeRaw from "rehype-raw";
import type { Schema } from '../../node_modules/rehype-sanitize/lib'
import { unified } from 'unified'
import type { Node } from 'unist'
import type { Root, Element } from 'hast'
import type { Plugin } from "unified";

type TextNode = Node & { type: 'text'; value: string }
type ParentNode = Node & { children: Node[] }

export interface Post {
    title: string,
    rkey: string,
    createdAt: Date,
    content: string, // content parsed to html
    excerpt: string,  // plain text excerpt for meta descriptions
    wordCount: number // word count for reading time calculation
}

export interface MarkdownPost {
    title: string,
    rkey: string,
    createdAt: Date,
    mdcontent: string // markdown content
}

// WhiteWind's own custom schema:
// https://github.com/whtwnd/whitewind-blog/blob/7eb8d4623eea617fd562b93d66a0e235323a2f9a/frontend/src/services/DocProvider.tsx#L122
const customSchema = {
    ...defaultSchema,
    attributes: {
        ...defaultSchema.attributes,
        font: [...(defaultSchema.attributes?.font ?? []), 'color'],
        blockquote: [
            ...(defaultSchema.attributes?.blockquote ?? []),
            // bluesky
            'className',
            'dataBlueskyUri',
            'dataBlueskyCid',
            // instagram
            'dataInstgrmCaptioned',
            'dataInstgrmPermalink',
            'dataInstgrmVersion'
        ],
        iframe: [
            'width', 'height', 'title', 'frameborder', 'allow', 'referrerpolicy', 'allowfullscreen', 'style', 'seamless',
            ['src', /https:\/\/(www.youtube.com|bandcamp.com)\/.*/]
        ],
      section: ['dataFootnotes', 'className']
    },
    tagNames: [...(defaultSchema.tagNames ?? []), 'font', 'mark', 'iframe', 'section']
  }

// Automatically enforce https on PDS images. Heavily inspired by WhiteWind's blob replacer:
// https://github.com/whtwnd/whitewind-blog/blob/7eb8d4623eea617fd562b93d66a0e235323a2f9a/frontend/src/services/DocProvider.tsx#L90
// In theory we could also use their cache, but I'd like to rely on their API as little as possible, opting to pull from the PDS instead.
const upgradeImage = (child: Node): void => {
    if (child.type !== 'element') {
        return
    }
    const elem = child as Element
    if (elem.tagName === 'img') {
        // Ensure https
        const src = elem.properties.src
        if (src !== undefined && typeof src === 'string') {
            elem.properties.src = src.replace(/http:\/\//, "https://")
        }
    }
    elem.children.forEach(child => upgradeImage(child))
}

const rehypeUpgradeImage: Plugin<[], Root, Node> = () => {
    return (tree) => {
      tree.children.forEach(child => upgradeImage(child))
    }
}

// Extract plain text from markdown for excerpts
async function extractTextFromMarkdown(markdown: string, maxLength: number = 160): Promise<string> {
    // Process the markdown to get plain text
    const plainText = String(
        await unified()
            .use(remarkParse, { fragment: true })
            .use(remarkGfm)
            .use(() => (tree) => {
                // Simple transformer that visits all nodes and removes everything but text
                const visit = (node: Node): string => {
                    if (node.type === 'text') {
                        const textNode = node as TextNode;
                        return textNode.value;
                    }
                    if ('children' in node) {
                        const parentNode = node as ParentNode;
                        return parentNode.children.map(visit).filter(Boolean).join(' ');
                    }
                    return '';
                };
                
                // Replace tree with just text content
                return { type: 'root', children: [{ type: 'text', value: visit(tree) }] };
            })
            .use(remarkRehype)
            .use(rehypeStringify)
            .process(markdown)
    );

    // Clean up the text
    let cleaned = plainText.replace(/\s+/g, ' ').trim();
    
    // Truncate to maxLength if necessary
    if (cleaned.length > maxLength) {
        cleaned = cleaned.substring(0, maxLength) + '...';
    }
    
    return cleaned;
}

export async function parse(mdposts: Map<string, MarkdownPost>) {
    const posts: Map<string, Post> = new Map()
    for (const [ rkey, post ] of mdposts) {
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
        
        // Extract plain text for excerpt
        const excerpt = await extractTextFromMarkdown(post.mdcontent);
        
        // Calculate word count from markdown content
        const wordCount = post.mdcontent.split(/\s+/).filter(word => word.length > 0).length;
        
        posts.set(rkey, {
            title: post.title,
            rkey: post.rkey,
            createdAt: post.createdAt,
            content: parsedHtml,
            excerpt,
            wordCount
        });
    }
    return posts
}