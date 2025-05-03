import type { RequestHandler } from './$types';
import { dev } from '$app/environment';
import { parse, type MarkdownPost } from '$lib/parser';

export const GET: RequestHandler = async ({ url, fetch }) => {
  try {
    // Import the profile and post loading logic from the blog layout
    const { PUBLIC_HANDLE } = await import('$env/static/public');
    
    // Get profile data
    const profileResponse = await fetch(`https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${PUBLIC_HANDLE}`);
    if (!profileResponse.ok) throw new Error(`Profile fetch failed: ${profileResponse.status}`);
    const profileData = await profileResponse.json();
    
    // Get DID document to find PDS URL
    const did = profileData.did;
    const didParts = did.split(":");
    let pdsUrl;
    
    if (didParts[0] === "did") {
      if (didParts[1] === "plc") {
        const didDocResponse = await fetch(`https://plc.directory/${did}`);
        if (!didDocResponse.ok) throw new Error(`DID doc fetch failed: ${didDocResponse.status}`);
        const didDoc = await didDocResponse.json();
        
        for (const service of didDoc.service) {
          if (service.id === "#atproto_pds") {
            pdsUrl = service.serviceEndpoint;
            break;
          }
        }
      } else if (didParts[1] === "web") {
        const didDocResponse = await fetch(`https://${didParts[2]}/.well-known/did.json`);
        if (!didDocResponse.ok) throw new Error(`DID doc fetch failed: ${didDocResponse.status}`);
        const didDoc = await didDocResponse.json();
        
        for (const service of didDoc.service) {
          if (service.id === "#atproto_pds") {
            pdsUrl = service.serviceEndpoint;
            break;
          }
        }
      }
    }
    
    if (!pdsUrl) throw new Error("Could not find PDS URL");
    
    // Get blog posts
    const postsResponse = await fetch(`${pdsUrl}/xrpc/com.atproto.repo.listRecords?repo=${did}&collection=com.whtwnd.blog.entry`);
    if (!postsResponse.ok) throw new Error(`Posts fetch failed: ${postsResponse.status}`);
    const postsData = await postsResponse.json();
    
    // Process posts
    const mdposts: Map<string, MarkdownPost> = new Map();
    for (const data of postsData.records) {
      const matches = data.uri.split("/");
      const rkey = matches[matches.length - 1];
      const record = data.value;
      
      if (matches && matches.length === 5 && record && (record.visibility === "public" || !record.visibility)) {
        mdposts.set(rkey, {
          title: record.title,
          createdAt: new Date(record.createdAt),
          mdcontent: record.content,
          rkey
        });
      }
    }
    
    // Parse markdown posts to HTML
    const posts = await parse(mdposts);
    
    // Sort posts by date (newest first)
    const sortedPosts = Array.from(posts.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    // Build the RSS XML
    const baseUrl = dev ? url.origin : 'https://ewancroft.uk'; // Update with your production domain
    const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:media="http://search.yahoo.com/mrss/">
<channel>
  <title>Ewan's Blog</title>
  <description>A personal blog where I share my thoughts on coding, technology, and life.</description>
  <link>${baseUrl}/blog</link>
  <atom:link href="${baseUrl}/blog/rss.xml" rel="self" type="application/rss+xml" />
  <image>
    <url>${baseUrl}/embed/blog.png</url>
    <title>Ewan's Blog</title>
    <link>${baseUrl}/blog</link>
  </image>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  ${sortedPosts.map(post => `
  <item>
    <title>${escapeXml(post.title)}</title>
    <link>${baseUrl}/blog/${post.rkey}</link>
    <guid isPermaLink="true">${baseUrl}/blog/${post.rkey}</guid>
    <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>
    <description><![CDATA[${post.excerpt || ''}]]></description>
    <content:encoded><![CDATA[${post.content || ''}]]></content:encoded>
    <author>${profileData.displayName || profileData.handle} (${profileData.handle})</author>
    <media:content url="${baseUrl}/embed/blog.png" medium="image" />
  </item>`).join('')}
</channel>
</rss>`;

    return new Response(rssXml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'max-age=0, s-maxage=3600'
      }
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    
    // Return a minimal valid RSS feed in case of error
    return new Response(`<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Ewan's Blog</title>
  <description>A personal blog where I share my thoughts on coding, technology, and life.</description>
  <link>${url.origin}/blog</link>
  <atom:link href="${url.origin}/blog/rss.xml" rel="self" type="application/rss+xml" />
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <!-- Error occurred while generating feed items -->
</channel>
</rss>`, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'no-cache'
      }
    });
  }
};

// Helper function to escape XML special characters
function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}