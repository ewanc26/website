/**
 * profileLinkLabels.ts — short labels for the profile link chips.
 *
 * Each chip shows just its link's domain, so unique hosts stay terse.
 * When several links share a host, their labels extend with only as
 * much of the path as needed to stay distinct: next to
 * github.com/ewanc26, github.com/sponsors/ewanc26 labels as
 * "github.com/sponsors". No two chips in the shelf read the same unless
 * two links resolve to the same host and path.
 *
 * Pure string work, no imports, so `node --test` can verify the rules.
 */

export function profileLinkLabels(urls: string[]): string[] {
  const parsed = urls.map((url) => new URL(url));

  const pathsByHost = new Map<string, string[][]>();
  parsed.forEach((u) => {
    const segs = u.pathname.split("/").filter(Boolean);
    const paths = pathsByHost.get(u.host) ?? [];
    paths.push(segs);
    pathsByHost.set(u.host, paths);
  });

  return parsed.map((u) => {
    const siblings = pathsByHost.get(u.host)!;
    if (siblings.length === 1) return u.host;

    const segs = u.pathname.split("/").filter(Boolean);
    // Grow the shared path prefix until every same-host sibling is unique.
    const deepest = Math.max(...siblings.map((p) => p.length));
    let depth = 1;
    while (depth <= deepest) {
      const labels = siblings.map((p) => p.slice(0, depth).join("/"));
      if (new Set(labels).size === siblings.length) break;
      depth++;
    }
    const path = segs.slice(0, depth).join("/");
    return path ? `${u.host}/${path}` : u.host;
  });
}
