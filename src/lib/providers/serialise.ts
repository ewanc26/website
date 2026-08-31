/**
 * Serialise Leaflet content for SvelteKit server→client transfer.
 *
 * The raw AT Protocol record contains BlobRef objects with CID class instances
 * that SvelteKit cannot dehydrate. This module does a JSON round-trip to
 * convert class instances to plain POJOs, then walks the result replacing
 * every image/previewImage BlobRef with a public blob URL stored as
 * `_imageSrc` / `_previewImageSrc`. The original blob fields are removed.
 */

type Obj = Record<string, unknown>;

/** A Leaflet block wrapper after BlobRef→URL serialisation. */
export interface SerialisedBlock {
  block: Obj;
  alignment?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  [key: string]: unknown;
}

/** A serialised Leaflet page. Canvas positioning metadata is preserved. */
export interface SerialisedPage {
  $type?: string;
  id?: string;
  blocks: SerialisedBlock[];
  [key: string]: unknown;
}

/** Complete reader-safe Leaflet content. */
export interface SerialisedContent {
  blocks: SerialisedBlock[];
  pages: SerialisedPage[];
  primaryPageType?: string;
  primaryPageId?: string;
}

/**
 * Build a network-readable blob URL from a DID and CID. Slingshot resolves the
 * owning PDS instead of assuming the document author lives on one fixed host.
 */
export function pdsBlobUrl(did: string, cid: string): string {
  return `https://slingshot.microcosm.blue/xrpc/com.atproto.sync.getBlob?did=${encodeURIComponent(did)}&cid=${encodeURIComponent(cid)}`;
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
 * with blob URLs. This intentionally walks nested gallery/list/page data,
 * so new Leaflet containers inherit blob handling without special cases.
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
      // Check if this is a BlobRef (after JSON round-trip).
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

/** Resolve inline or blob-backed pages from a Leaflet content record. */
async function readPages(
  content: unknown,
  fetchBlob: (ref: unknown) => Promise<Uint8Array>,
): Promise<Obj[]> {
  const c = content as Obj;

  // pub.leaflet.content explicitly says blobPages is authoritative when set:
  // consumers MUST ignore the inline pages array, which may only be a stub.
  if (c.blobPages) {
    try {
      const bytes = await fetchBlob(c.blobPages);
      const decoded = JSON.parse(new TextDecoder().decode(bytes));
      return Array.isArray(decoded) ? (decoded as Obj[]) : [];
    } catch {
      return [];
    }
  }

  return Array.isArray(c.pages) ? (c.pages as Obj[]) : [];
}

/**
 * Serialise all Leaflet pages. Page order is significant: the first page is
 * the document's entry page, regardless of whether it is linear or canvas.
 * Page blocks can reference sibling pages by id, so a faithful reader keeps
 * the complete page set available to the renderer.
 */
export async function serialiseContent(
  content: unknown,
  did: string,
  fetchBlob: (ref: unknown) => Promise<Uint8Array>,
): Promise<SerialisedContent> {
  const rawPages = await readPages(content, fetchBlob);

  // JSON round-trip converts BlobRef/CID class instances to plain POJOs.
  const pages = JSON.parse(JSON.stringify(rawPages)) as SerialisedPage[];
  replaceBlobs(pages, did);

  for (const page of pages) {
    if (!Array.isArray(page.blocks)) page.blocks = [];
  }

  const primary = pages[0];
  return {
    blocks: primary?.blocks ?? [],
    pages,
    primaryPageType: primary?.$type,
    primaryPageId: primary?.id,
  };
}

/**
 * Backwards-compatible helper for callers that only need the primary page.
 */
export async function serialiseBlocks(
  content: unknown,
  did: string,
  fetchBlob: (ref: unknown) => Promise<Uint8Array>,
): Promise<SerialisedBlock[]> {
  return (await serialiseContent(content, did, fetchBlob)).blocks;
}
