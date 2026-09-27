import assert from "node:assert/strict";
import test from "node:test";
import { buildNormalizedTags, buildTagGroups, normalizeTag } from "./tags.ts";

type Post = { rkey: string; tags: string[] };

function posts(spec: Array<[number, string[]]>): Post[] {
  let n = 0;
  return spec.flatMap(([count, tags]) =>
    Array.from({ length: count }, () => ({ rkey: `p${n++}`, tags })),
  );
}

test("normalizes tag spelling", () => {
  assert.equal(normalizeTag("  #Small_Web "), "small web");
});

test("broad tags do not chain unrelated topics into one group", () => {
  // Mirrors the real archive: "personal" and "reflection" are sprinkled across
  // a minority of posts in every topic, which used to chain atproto, apple and
  // tooling into one giant cluster.
  const groups = buildTagGroups(
    buildNormalizedTags(
      posts([
        [4, ["atproto", "bluesky"]],
        [3, ["atproto", "leaflet"]],
        [2, ["atproto", "bluesky", "personal"]],
        [2, ["atproto", "leaflet", "reflection"]],
        [4, ["apple", "airpods"]],
        [2, ["apple", "airpods", "personal", "reflection"]],
        [4, ["tooling", "rust"]],
        [1, ["tooling", "rust", "reflection"]],
        [10, ["personal", "reflection"]],
        [30, ["misc"]],
      ]),
    ),
  );

  const byRoot = new Map(groups.map((g) => [g.name, g.tags.map((t) => t.name)]));
  const sorted = (names: string[]) => [...names].sort().join();
  assert.deepEqual(byRoot.get("atproto"), ["atproto", "bluesky", "leaflet"]);
  assert.ok(groups.some((g) => sorted(g.tags.map((t) => t.name)) === "airpods,apple"));
  assert.ok(groups.some((g) => sorted(g.tags.map((t) => t.name)) === "rust,tooling"));

  for (const members of byRoot.values()) {
    const topics = ["atproto", "apple", "tooling", "rust", "airpods"].filter((t) =>
      members.includes(t),
    );
    const sameTopic = sorted(topics) === "airpods,apple" || sorted(topics) === "rust,tooling";
    assert.ok(topics.length <= 1 || sameTopic, `mixed topics in one group: ${members}`);
  }
});

test("groups spelling variants with their root", () => {
  const groups = buildTagGroups(
    buildNormalizedTags(
      posts([
        [5, ["apple"]],
        [1, ["apple inc."]],
        [3, ["atproto"]],
        [1, ["at protocol"]],
        [1, ["apple music"]],
      ]),
    ),
  );
  const byRoot = new Map(groups.map((g) => [g.name, g.tags.map((t) => t.name)]));
  assert.deepEqual(byRoot.get("apple"), ["apple", "apple inc."]);
  assert.deepEqual(byRoot.get("atproto"), ["atproto", "at protocol"]);
});

test("does not group tags that merely share one post", () => {
  const groups = buildTagGroups(
    buildNormalizedTags(posts([[3, ["games"]], [1, ["games", "labour"]], [2, ["labour"]]])),
  );
  assert.equal(groups.length, 0);
});
