import type { LeafletComment } from "$lib/services/atproto/fetch";

export interface ThreadEntry {
  comment: LeafletComment;
  depth: number;
}

export function buildThread(items: LeafletComment[]): ThreadEntry[] {
  const byUri = new Map(items.map((c) => [c.uri, c]));
  const children = new Map<string, LeafletComment[]>();
  const roots: LeafletComment[] = [];

  for (const comment of items) {
    const parent = comment.reply?.parent;
    if (parent && byUri.has(parent) && parent !== comment.uri) {
      const list = children.get(parent) ?? [];
      list.push(comment);
      children.set(parent, list);
    } else {
      roots.push(comment);
    }
  }

  const output: ThreadEntry[] = [];
  const seen = new Set<string>();
  const visit = (comment: LeafletComment, depth: number) => {
    if (seen.has(comment.uri)) return;
    seen.add(comment.uri);
    output.push({ comment, depth: Math.min(depth, 6) });
    for (const child of children.get(comment.uri) ?? [])
      visit(child, depth + 1);
  };

  for (const root of roots) visit(root, 0);
  for (const comment of items) visit(comment, 0);
  return output;
}
