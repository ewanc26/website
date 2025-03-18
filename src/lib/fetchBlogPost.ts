import type { MarkdownPost } from "./parser";
import { did, pds } from "./data/profile.json";

// Parse AT Protocol URI
function parseURI(uri: string) {
  const components = uri.split('/');
  return {
    DID: components[2],
    collection: components[3],
    rkey: components[4]
  };
}

// Fetch a record by its URI
export async function fetchRecordByURI(uri: string) {
  const info = parseURI(uri);
  const url = `https://${pds}/xrpc/com.atproto.repo.getRecord?repo=${info.DID}&collection=${info.collection}&rkey=${info.rkey}`;

  try {
    const response = await fetch(url, { method: 'GET' });
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    return await response.json();
  } catch (err: unknown) {
    console.error('Error fetching record:', err);
    if (err instanceof Error) {
      throw new Error(err.message);
    } else {
      throw new Error(String(err));
    }
  }
}

// Create image URL from blob CID
export function getBlobUrl(cid: string, blobUrl?: string): string {
  if (!cid) return '';

  if (blobUrl) {
    return `${blobUrl}/${did}/${cid}`;
  } else {
    return `https://${pds}/xrpc/com.atproto.sync.getBlob?did=${did}&cid=${cid}`;
  }
}

// Process post content to handle any image URLs
function processContent(content: string, blobs?: any[]): string {
  if (!blobs || blobs.length === 0) {
    return content;
  }

  let processedContent = content;
  
  // For each blob in the post, replace markdown image references with properly formed URLs
  blobs.forEach((blob) => {
    if (blob && blob.cid) {
      // Look for markdown images that reference this blob
      const imgRegex = new RegExp(`!\\[([^\\]]*)\\]\\(at:\\/\\/blob\\/${blob.cid}\\)`, 'g');
      processedContent = processedContent.replace(
        imgRegex, 
        (match, altText) => `![${altText}](${getBlobUrl(blob.cid)})`
      );
    }
  });

  return processedContent;
}

// Fetch blog post
export async function fetchBlogPost(rkey: string): Promise<MarkdownPost> {
  try {
    const response = await fetchRecordByURI(`at://${did}/com.whtwnd.blog.entry/${rkey}`);
    
    if (!response) {
      throw new Error(`Could not load post with rkey ${rkey}`);
    }
    
    // Process the content to handle any image references
    let mdcontent = response.value.content || '';
    
    // If the post has blobs, process the content to handle image references
    if (response.value.blobs && response.value.blobs.length > 0) {
      mdcontent = processContent(mdcontent, response.value.blobs);
    }
    
    return {
      title: response.value.title || 'Untitled Post',
      rkey: rkey,
      createdAt: new Date(response.value.createdAt),
      mdcontent: mdcontent
    };
  } catch (err: unknown) {
    console.error('Error loading blog post:', err);
    throw err;
  }
}