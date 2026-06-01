/**
 * Serialise Leaflet content blocks for SvelteKit server→client transfer.
 *
 * The raw AT Protocol record contains BlobRef objects with CID class instances
 * that SvelteKit cannot dehydrate. This module does a JSON round-trip to
 * convert class instances to plain POJOs, then walks the result replacing
 * every image/previewImage BlobRef with a PDS blob URL stored as
 * `_imageSrc` / `_previewImageSrc`. The original blob fields are removed.
 */

const LINEAR = "pub.leaflet.pages.linearDocument";

type Obj = Record<string, unknown>;

/** A Leaflet block wrapper after BlobRef→URL serialisation. */
export interface SerialisedBlock {
  block: Obj;
  alignment?: string;
}

/**
 * Build a PDS blob URL from a DID and a CID string.
 */
export function pdsBlobUrl(did: string, cid: string): string {
  return `https://eurosky.social/xrpc/com.atproto.sync.getBlob?did=${encodeURIComponent(did)}&cid=${encodeURIComponent(cid)}`;
}

/**
 * Extract CID string from a plain-object BlobRef (after JSON round-trip).
 * Shape: { $type: "blob", ref: { $link: "bafy..." }, mimeType, size }
 * or legacy: { ref: { $link: "bafy..." } } or { ref: "bafy..." }
 */
function extractCid(obj: Obj): string | null {
  const ref = obj.ref;
  if (typeof ref === "string") return ref;
  if (ref && typeof ref === "object" && "$link" in (ref as Obj)) {
    return (ref as Obj).$link as string;
  }
  return null;
}

/**
 * Walk a plain-object tree, replacing image/previewImage BlobRefs
 * with PDS blob URLs.
 */
function replaceBlobs(obj: unknown, did: string): void {
  if (Array.isArray(obj)) {
    obj.forEach((item) => replaceBlobs(item, did));
    return;
  }
  if (typeof obj !== "object" || obj === null) return;

  const o = obj as Obj;
  for (const [key, val] of Object.entries(o)) {
    if (val && typeof val === "object" && !Array.isArray(val)) {
      const v = val as Obj;
      // Check if this is a BlobRef (after JSON round-trip)
      if (v.$type === "blob" || ("mimeType" in v && "ref" in v)) {
        const cid = extractCid(v);
        if (cid) {
          const url = pdsBlobUrl(did, cid);
          if (key === "image") {
            o._imageSrc = url;
            delete o.image;
          } else if (key === "previewImage") {
            o._previewImageSrc = url;
            delete o.previewImage;
          } else {
            o[key] = url;
          }
        }
      } else {
        replaceBlobs(v, did);
      }
    } else if (Array.isArray(val)) {
      replaceBlobs(val, did);
    }
  }
}

/**
 * Serialise a Leaflet content record into a plain-POJO blocks array
 * safe for SvelteKit dehydration.
 *
 * @param content The raw `pub.leaflet.content` record value
 * @param did The DID that owns the record (for blob URL construction)
 * @param fetchBlob Async function to fetch blob pages if needed
 * @returns The blocks array with BlobRefs replaced by PDS URLs
 */
export async function serialiseBlocks(
  content: unknown,
  did: string,
  fetchBlob: (ref: unknown) => Promise<Uint8Array>,
): Promise<SerialisedBlock[]> {
  const c = content as Obj;
  let pages = (c.pages as Obj[]) ?? [];

  // Handle blobPages (large content stored as a blob)
  if (c.blobPages) {
    try {
      const bytes = await fetchBlob(c.blobPages);
      pages = JSON.parse(new TextDecoder().decode(bytes)) as Obj[];
    } catch {
      /* fall back to inline pages */
    }
  }

  const page = pages.find((p) => p.$type === LINEAR) ?? pages[0];
  const blocks = (page?.blocks as Obj[]) ?? [];

  // JSON round-trip converts BlobRef/CID class instances to plain POJOs.
  // BlobRef.toJSON() produces { $type: "blob", ref: { $link: "cid" }, ... }
  // CID.toString() produces the CID string.
  const cloned = JSON.parse(JSON.stringify(blocks)) as SerialisedBlock[];

  // Walk the cloned blocks, replacing BlobRefs with PDS URLs
  replaceBlobs(cloned, did);

  return cloned;
}
