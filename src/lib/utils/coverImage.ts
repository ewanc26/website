/**
 * Find a fallback cover for a Leaflet post: the CID of the first image block in
 * its inline content, in reading order. Posts whose pages live in a separate
 * `blobPages` blob are skipped rather than fetched, so the blog index never
 * pays an extra request per post.
 */

type Obj = Record<string, unknown>;

function cidOf(ref: unknown): string | null {
  if (typeof ref === "string") return ref;
  if (!ref || typeof ref !== "object") return null;
  const r = ref as Obj;
  if (typeof r.$link === "string") return r.$link;
  // multiformats CID after a JSON round-trip.
  if (typeof r["/"] === "string") return r["/"];
  return null;
}

function isImageBlob(value: unknown): value is Obj {
  if (!value || typeof value !== "object") return false;
  const v = value as Obj;
  return (
    (v.$type === "blob" || "ref" in v) &&
    (typeof v.mimeType !== "string" || v.mimeType.startsWith("image/"))
  );
}

function findImage(node: unknown): string | null {
  if (Array.isArray(node)) {
    for (const item of node) {
      const cid = findImage(item);
      if (cid) return cid;
    }
    return null;
  }
  if (!node || typeof node !== "object") return null;

  for (const [key, value] of Object.entries(node as Obj)) {
    if (key === "image" && isImageBlob(value)) {
      const cid = cidOf(value.ref);
      if (cid) return cid;
    }
    const cid = findImage(value);
    if (cid) return cid;
  }
  return null;
}

export function firstContentImageCid(content: unknown): string | null {
  if (!content || typeof content !== "object") return null;
  const c = content as Obj;
  if (c.blobPages || !Array.isArray(c.pages)) return null;

  // Round-trip so class instances (BlobRef, CID) become plain JSON shapes.
  return findImage(JSON.parse(JSON.stringify(c.pages)));
}
