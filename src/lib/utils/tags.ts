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

function tokenSimilarity(a: string, b: string): number {
  const aTokens = new Set(a.split(" ").filter(Boolean));
  const bTokens = new Set(b.split(" ").filter(Boolean));
  if (!aTokens.size || !bTokens.size) return 0;

  let intersection = 0;
  for (const token of aTokens) {
    if (bTokens.has(token)) intersection += 1;
  }

  return intersection / (aTokens.size + bTokens.size - intersection);
}

function cooccurrenceSimilarity(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;

  let intersection = 0;
  for (const rkey of a) {
    if (b.has(rkey)) intersection += 1;
  }

  return intersection / Math.min(a.size, b.size);
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  let intersection = 0;
  for (const rkey of a) {
    if (b.has(rkey)) intersection += 1;
  }

  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function buildTagGroups(
  tags: Map<string, NormalizedTag>,
  maxGroups = 6,
  maxRelated = 5,
) {
  const names = [...tags.keys()].sort(
    (a, b) => (tags.get(b)!.count - tags.get(a)!.count) || a.localeCompare(b),
  );
  const grouped = new Set<string>();
  const groups: {
    name: string;
    count: number;
    tags: { name: string; count: number }[];
  }[] = [];

  for (const root of names) {
    if (grouped.has(root)) continue;

    const rootTag = tags.get(root)!;
    const related = names
      .filter((name) => name !== root && !grouped.has(name))
      .map((name) => {
        const candidate = tags.get(name)!;
        const cooccurrence = cooccurrenceSimilarity(rootTag.posts, candidate.posts);
        const jaccard = jaccardSimilarity(rootTag.posts, candidate.posts);
        const lexical = tokenSimilarity(root, name);
        const score = cooccurrence * 0.65 + jaccard * 0.2 + lexical * 0.15;

        return { name, candidate, cooccurrence, lexical, score };
      })
      .filter(
        ({ candidate, cooccurrence, lexical, score }) =>
          candidate.count >= 2 &&
          score >= 0.2 &&
          (cooccurrence >= 0.25 || lexical >= 0.5),
      )
      .sort(
        (a, b) =>
          b.score - a.score ||
          b.candidate.count - a.candidate.count ||
          a.name.localeCompare(b.name),
      )
      .slice(0, maxRelated);

    if (rootTag.count < 2 || related.length === 0) continue;

    grouped.add(root);
    for (const item of related) grouped.add(item.name);

    groups.push({
      name: root,
      count: rootTag.count,
      tags: [root, ...related.map((item) => item.name)].map((name) => ({
        name,
        count: tags.get(name)!.count,
      })),
    });

    if (groups.length >= maxGroups) break;
  }

  return groups;
}
