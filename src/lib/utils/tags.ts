export function normalizeTag(tag: string): string {
  return tag
    .normalize("NFKC")
    .trim()
    .replace(/^#+/, "")
    .replace(/[_]+/g, " ")
    .replace(/\s+/g, " ")
    .toLocaleLowerCase();
}

export interface NormalizedTag {
  name: string;
  count: number;
  posts: Set<string>;
}

export function buildNormalizedTags(
  posts: Array<{ rkey: string; tags?: string[] | null }>,
): Map<string, NormalizedTag> {
  const result = new Map<string, NormalizedTag>();

  for (const post of posts) {
    const seen = new Set<string>();
    for (const rawTag of post.tags ?? []) {
      const name = normalizeTag(rawTag);
      if (!name || seen.has(name)) continue;
      seen.add(name);

      const existing = result.get(name);
      if (existing) {
        existing.count += 1;
        existing.posts.add(post.rkey);
      } else {
        result.set(name, {
          name,
          count: 1,
          posts: new Set([post.rkey]),
        });
      }
    }
  }

  return result;
}

/**
 * Near-duplicate spellings of one idea: "at protocol" / "atproto" /
 * "atprotocol", "apple" / "apple inc.", "pagan" / "paganism". Spacing and
 * punctuation are ignored, and a longer spelling may only add a short suffix,
 * so "apple music" or "personal website" stay distinct from their first word.
 */
function isLexicalVariant(a: string, b: string): boolean {
  const compact = (tag: string) => tag.replace(/[\s._-]+/g, "");
  const [short, long] = [compact(a), compact(b)].sort((x, y) => x.length - y.length);
  return short.length >= 4 && long.startsWith(short) && long.length - short.length <= 4;
}

function overlap(a: Set<string>, b: Set<string>): number {
  let count = 0;
  for (const rkey of a) {
    if (b.has(rkey)) count += 1;
  }
  return count;
}

/**
 * Group tags around the broadest topics.
 *
 * Every tag picks at most one parent: a broader tag that it mostly
 * appears alongside (at least `minShare` of its posts) and is specifically tied
 * to (it appears with the parent at least `minLift` times more often than
 * chance), or a spelling variant of itself. When several tags qualify, the one
 * with the strongest lift wins. Because a tag attaches to its single best
 * parent rather than to anything it co-occurs with, broad tags on most posts
 * ("personal", "reflection") can't chain unrelated topics into one cluster.
 */
export function buildTagGroups(
  tags: Map<string, NormalizedTag>,
  maxGroups = 6,
  maxRelated = 5,
  minShare = 0.5,
  minLift = 1.5,
  minShared = 3,
) {
  const allPosts = new Set<string>();
  for (const tag of tags.values()) {
    for (const rkey of tag.posts) allPosts.add(rkey);
  }

  const ranked = [...tags.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name),
  );

  const parentOf = new Map<string, { parent: NormalizedTag; shared: number }>();

  for (const tag of ranked) {
    let best: { parent: NormalizedTag; shared: number; score: number } | undefined;

    for (const candidate of ranked) {
      if (candidate === tag || candidate.count < tag.count) continue;
      if (candidate.count === tag.count && candidate.name >= tag.name) continue;

      const shared = overlap(tag.posts, candidate.posts);
      const variant = isLexicalVariant(tag.name, candidate.name);
      const share = shared / tag.count;
      const lift = share / (candidate.count / allPosts.size);
      // A similar-sized peer only counts when the two mostly travel together
      // (e.g. "rust" and "learning"); otherwise the parent must be clearly
      // broader, so peers don't swallow each other.
      const related =
        (tag.count <= candidate.count * 0.75 || share >= 0.6) &&
        shared >= minShared &&
        share >= minShare &&
        lift >= minLift;
      if (!variant && !related) continue;

      // Spelling variants always win; otherwise prefer the most specific parent.
      const score = variant ? Number.POSITIVE_INFINITY : lift;
      if (!best || score > best.score) best = { parent: candidate, shared, score };
    }

    if (best) parentOf.set(tag.name, { parent: best.parent, shared: best.shared });
  }

  // Attach each tag to the top of its parent chain so every tag shows once.
  const rootOf = (name: string) => {
    let current = name;
    const seen = new Set<string>();
    while (parentOf.has(current) && !seen.has(current)) {
      seen.add(current);
      current = parentOf.get(current)!.parent.name;
    }
    return current;
  };

  const children = new Map<string, Array<{ tag: NormalizedTag; shared: number }>>();
  for (const [name, { shared }] of parentOf) {
    const root = rootOf(name);
    if (!children.has(root)) children.set(root, []);
    children.get(root)!.push({ tag: tags.get(name)!, shared });
  }

  return ranked
    .filter((tag) => children.has(tag.name) && !parentOf.has(tag.name))
    .slice(0, maxGroups)
    .map((root) => {
      const members = children
        .get(root.name)!
        .sort(
          (a, b) =>
            b.shared - a.shared ||
            b.tag.count - a.tag.count ||
            a.tag.name.localeCompare(b.tag.name),
        )
        .slice(0, maxRelated);

      return {
        name: root.name,
        count: root.count,
        tags: [root, ...members.map(({ tag }) => tag)].map(({ name, count }) => ({
          name,
          count,
        })),
      };
    });
}
