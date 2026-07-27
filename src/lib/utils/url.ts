/**
 * URL safety helpers for untrusted remote content.
 *
 * Leaflet blocks, facets, publication records, and profile data all come
 * from remote AT Protocol repositories and must be treated as hostile.
 * Interpolating an unvalidated string into `href`/`src` allows
 * `javascript:`, `data:`, and `vbscript:` URLs to execute in the page.
 */

/** Schemes we are willing to put in a link or embed. */
const SAFE_LINK_PROTOCOLS = new Set(["http:", "https:", "mailto:", "at:"]);

/** Schemes we are willing to load as a subresource (image/iframe). */
const SAFE_RESOURCE_PROTOCOLS = new Set(["http:", "https:"]);

function parse(raw: unknown): URL | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    // Relative URLs are resolved against a throwaway base so that
    // site-relative hrefs (e.g. "/blog") stay usable.
    return new URL(trimmed, "https://invalid.example");
  } catch {
    return null;
  }
}

/**
 * Return `url` when it is safe to use as a link target, otherwise
 * `undefined`. Relative URLs are preserved verbatim.
 */
export function safeLinkUrl(url: unknown): string | undefined {
  const parsed = parse(url);
  if (!parsed || !SAFE_LINK_PROTOCOLS.has(parsed.protocol)) return undefined;
  return typeof url === "string" ? url.trim() : undefined;
}

/**
 * Return `url` when it is safe to load as an image or iframe source,
 * otherwise `undefined`. Only absolute http(s) URLs are accepted.
 */
export function safeResourceUrl(url: unknown): string | undefined {
  const parsed = parse(url);
  if (!parsed || !SAFE_RESOURCE_PROTOCOLS.has(parsed.protocol)) {
    return undefined;
  }
  return typeof url === "string" ? url.trim() : undefined;
}

/**
 * Human-readable hostname for a URL, or `undefined` when the URL cannot
 * be parsed. Never throws — remote data routinely contains junk.
 */
export function safeHostname(url: unknown): string | undefined {
  if (typeof url !== "string") return undefined;
  try {
    return new URL(url.trim()).hostname;
  } catch {
    return undefined;
  }
}
