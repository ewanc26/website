/**
 * The CID inside a blob reference, whichever shape it arrives in:
 * a bare string, `{ $link }` (raw XRPC JSON), `{ "/" }` (what the lex client's
 * CID instances serialise to), a CID instance, or a blob wrapping any of those
 * under `ref`.
 *
 * No imports, so `node --test` can load it.
 */
export function blobRefCid(value: unknown): string | null {
  if (typeof value === "string") return value || null;
  if (!value || typeof value !== "object") return null;
  const o = value as Record<string, unknown>;
  if (typeof o.$link === "string") return o.$link;
  if (typeof o["/"] === "string") return o["/"];
  if ("ref" in o) return blobRefCid(o.ref);
  // A CID instance stringifies to itself; a plain object does not.
  const text = String(value);
  return text.startsWith("[object") ? null : text;
}
