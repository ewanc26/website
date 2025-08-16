import type { RequestHandler } from "./$types";
import { dev } from "$app/environment";
import { getProfile } from "$components/profile/profile";
import { escapeXml } from "$lib/utils/xml";
import { TTLCache } from "$utils/cache";

// TTL cache for RSS feed XML (5 min)
const FEED_CACHE_TTL = 5 * 60 * 1000;
const rssFeedCache = new TTLCache<string>(FEED_CACHE_TTL);

// Leaflet document structure
interface LeafletDocument {
  $type: "pub.leaflet.document";
  title: string;
  description?: string;
  publishedAt?: string;
  publication: string;
  author: string;
  pages: Array<{
    $type: "pub.leaflet.pages.linearDocument";
    blocks?: Array<{
      block: {
        $type: string;
        plaintext?: string;
        [key: string]: any;
      };
    }>;
  }>;
}

/**
 * Converts Leaflet document to plain text for RSS
 */
function leafletToPlainText(pages: LeafletDocument['pages']): { content: string; excerpt: string } {
  let plainTextContent = '';
  
  for (const page of pages) {
    if (page.blocks) {
      for (const blockWrapper of page.blocks) {
        const block = blockWrapper.block;
        
        if (block.plaintext) {
          plainTextContent += block.plaintext + '\n\n';
        }
      }
    }
  }
  
  const trimmedContent = plainTextContent.trim();
  const words = trimmedContent.split(/\s+/).filter(word => word.length > 0);
  const excerpt = words.slice(0, 50).join(' ') + (words.length > 50 ? '...' : '');
  
  return {
    content: trimmedContent,
    excerpt
  };
}

/**
 * Converts Leaflet document to HTML for RSS
 */
function leafletToHtml(pages: LeafletDocument['pages']): string {
  let htmlContent = '';
  
  for (const page of pages) {
    if (page.blocks) {
      for (const blockWrapper of page.blocks) {
        const block = blockWrapper.block;
        
        switch (block.$type) {
          case 'pub.leaflet.blocks.text':
            if (block.plaintext) {
              htmlContent += `<p>${escapeXml(block.plaintext)}</p>`;
            }
            break;
            
          case 'pub.leaflet.blocks.header':
            const level = (block as any).level || 1;
            if (block.plaintext) {
              htmlContent += `<h${level}>${escapeXml(block.plaintext)}</h${level}>`;
            }
            break;
            
          case 'pub.leaflet.blocks.blockquote':
            if (block.plaintext) {
              htmlContent += `<blockquote>${escapeXml(block.plaintext)}</blockquote>`;
            }
            break;
            
          case 'pub.leaflet.blocks.code':
            if (block.plaintext) {
              htmlContent += `<pre><code>${escapeXml(block.plaintext)}</code></pre>`;
            }
            break;
            
          case 'pub.leaflet.blocks.unorderedList':
            const children = (block as any).children || [];
            if (children.length > 0) {
              htmlContent += '<ul>';
              for (const item of children) {
                if (item.content?.plaintext) {
                  htmlContent += `<li>${escapeXml(item.content.plaintext)}</li>`;
                }
              }
              htmlContent += '</ul>';
            }
            break;
            
          case 'pub.leaflet.blocks.horizontalRule':
            htmlContent += '<hr>';
            break;
            
          default:
            // Fallback for other block types
            if (block.plaintext) {
              htmlContent += `<p>${escapeXml(block.plaintext)}</p>`;
            }
        }
      }
    }
  }
  
  return htmlContent;
}

export const GET: RequestHandler = async ({ url, fetch }) => {
  // Check cache first
  const cached = rssFeedCache.get();
  if (cached) {
    return new Response(cached, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "max-age=0, s-maxage=3600",
      },
    });
  }

  try {
    // Use getProfile to get profile data
    const profileData = await getProfile(fetch);
    const did = profileData.did;
    const pdsUrl = profileData.pds;

    if (!pdsUrl) throw new Error("Could not find PDS URL");

    // Get Leaflet documents instead of WhiteWind posts
    const documentsResponse = await fetch(
      `${pdsUrl}/xrpc/com.atproto.repo.listRecords?repo=${did}&collection=pub.leaflet.document`
    );
    
    if (!documentsResponse.ok) {
      throw new Error(`Documents fetch failed: ${documentsResponse.status}`);
    }
    
    const documentsData = await documentsResponse.json();

    // Process Leaflet documents
    const processedDocs: Array<{
      title: string;
      rkey: string;
      publishedAt: Date;
      content: string;
      excerpt: string;
    }> = [];

    for (const data of documentsData.records) {
      const matches = data.uri.split("/");
      const rkey = matches[matches.length - 1];
      const record = data.value as LeafletDocument;

      // Validate Leaflet document
      if (
        matches &&
        matches.length === 5 &&
        record &&
        record.$type === 'pub.leaflet.document' &&
        record.title &&
        record.pages &&
        record.pages.length > 0
      ) {
        const publishedAt = record.publishedAt ? new Date(record.publishedAt) : new Date();
        
        // Skip documents with invalid dates
        if (isNaN(publishedAt.getTime())) {
          continue;
        }

        const { content, excerpt } = leafletToPlainText(record.pages);
        const htmlContent = leafletToHtml(record.pages);

        processedDocs.push({
          title: record.title,
          rkey,
          publishedAt,
          content: htmlContent,
          excerpt,
        });
      }
    }

    // Sort documents by date (newest first)
    const sortedDocs = processedDocs.sort(
      (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
    );

    // Build the RSS XML
    const baseUrl = dev ? url.origin : "https://ewancroft.uk";
    const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:media="http://search.yahoo.com/mrss/">
<channel>
  <title>Blog - Ewan's Corner</title>
  <description>A personal blog where I share my thoughts on coding, technology, and life.</description>
  <link>${baseUrl}/blog</link>
  <atom:link href="${baseUrl}/blog/rss" rel="self" type="application/rss+xml" />
  <image>
    <url>${baseUrl}/api/og/blog.png</url>
    <title>Blog - Ewan's Corner</title>
    <link>${baseUrl}/blog</link>
  </image>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  ${sortedDocs
    .map(
      (doc) => `
  <item>
    <title>${escapeXml(doc.title)}</title>
    <link>${baseUrl}/blog/${doc.rkey}</link>
    <guid isPermaLink="true">${baseUrl}/blog/${doc.rkey}</guid>
    <pubDate>${doc.publishedAt.toUTCString()}</pubDate>
    <description><![CDATA[${doc.excerpt || ""}]]></description>
    <content:encoded><![CDATA[${doc.content || ""}]]></content:encoded>
    <author>${profileData.displayName || profileData.handle} (${
        profileData.handle
      })</author>
   <media:content url="${baseUrl}/api/og/blog/${doc.rkey}.png" medium="image" />
  </item>`
    )
    .join("")}
</channel>
</rss>`;

    // Cache the result
    rssFeedCache.set(rssXml);

    return new Response(rssXml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "max-age=0, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Error generating RSS feed:", error);

    // Return a minimal valid RSS feed in case of error
    const baseUrl = dev ? url.origin : "https://ewancroft.uk";
    return new Response(
      `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Blog - Ewan's Corner</title>
  <description>A personal blog where I share my thoughts on coding, technology, and life.</description>
  <link>${baseUrl}/blog</link>
  <atom:link href="${baseUrl}/blog/rss" rel="self" type="application/rss+xml" />
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <!-- Error occurred while generating feed items -->
</channel>
</rss>`,
      {
        headers: {
          "Content-Type": "application/xml",
          "Cache-Control": "no-cache",
        },
      }
    );
  }
};