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

interface TagEdge {
  score: number;
}

export function buildTagGroups(
  tags: Map<string, NormalizedTag>,
  maxGroups = 6,
  maxRelated = 5,
) {
  const names = [...tags.keys()].sort(
    (a, b) => (tags.get(b)!.count - tags.get(a)!.count) || a.localeCompare(b),
  );

  const adjacency = new Map<string, Map<string, number>>();

  for (let i = 0; i < names.length; i += 1) {
    const a = names[i];
    const aTag = tags.get(a)!;

    for (let j = i + 1; j < names.length; j += 1) {
      const b = names[j];
      const bTag = tags.get(b)!;

      if (aTag.count < 2 && bTag.count < 2) continue;

      const cooccurrence = cooccurrenceSimilarity(aTag.posts, bTag.posts);
      const jaccard = jaccardSimilarity(aTag.posts, bTag.posts);
      const lexical = tokenSimilarity(a, b);
      const score = cooccurrence * 0.6 + jaccard * 0.25 + lexical * 0.15;

      if (score < 0.2 || (cooccurrence < 0.25 && lexical < 0.5)) continue;

      if (!adjacency.has(a)) adjacency.set(a, new Map());
      if (!adjacency.has(b)) adjacency.set(b, new Map());
      adjacency.get(a)!.set(b, score);
      adjacency.get(b)!.set(a, score);
    }
  }

  const communities: string[][] = [];
  const visited = new Set<string>();

  for (const name of names) {
    if (visited.has(name) || !adjacency.has(name)) continue;

    const queue = [name];
    const community: string[] = [];
    visited.add(name);

    while (queue.length) {
      const current = queue.shift()!;
      community.push(current);

      for (const [neighbor, score] of adjacency.get(current) ?? []) {
        if (score < 0.2 || visited.has(neighbor)) continue;
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }

    if (community.length > 1) communities.push(community);
  }

  return communities
    .map((community) => {
      const ranked = community
        .map((name) => ({
          name,
          count: tags.get(name)!.count,
          degree: [...(adjacency.get(name)?.values() ?? [])].reduce(
            (sum, score) => sum + score,
            0,
          ),
        }))
        .sort(
          (a, b) =>
            b.count - a.count ||
            b.degree - a.degree ||
            a.name.localeCompare(b.name),
        );

      const selected = ranked.slice(0, maxRelated + 1);
      const root = selected[0];

      return {
        name: root.name,
        count: root.count,
        tags: selected.map(({ name, count }) => ({ name, count })),
        totalCount: community.reduce(
          (sum, name) => sum + tags.get(name)!.count,
          0,
        ),
      };
    })
    .filter((group) => group.tags.length > 1)
    .sort(
      (a, b) =>
        b.totalCount - a.totalCount ||
        b.count - a.count ||
        a.name.localeCompare(b.name),
    )
    .slice(0, maxGroups)
    .map(({ totalCount: _totalCount, ...group }) => group);
}
