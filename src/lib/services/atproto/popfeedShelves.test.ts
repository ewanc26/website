import assert from "node:assert/strict";
import test from "node:test";
import { popfeedShelves } from "./popfeedShelves.ts";

type Entry = Parameters<typeof popfeedShelves>[0][number];

function entry(title: string, creativeWorkType?: string): Entry {
  return {
    uri: `at://did/${title}`,
    title,
    genres: [],
    createdAt: "",
    creativeWorkType,
  };
}

test("groups reviews by creative work type into their shelves", () => {
  const shelves = popfeedShelves([
    entry("Heat", "movie"),
    entry("The Wire", "tv_show"),
    entry("Dune", "book"),
    entry("Hades", "video_game"),
    entry("Blue", "album"),
  ]);

  assert.deepEqual(
    shelves.map((s) => [s.word, s.items.map((i) => i.title)]),
    [
      ["Watching", ["Heat", "The Wire"]],
      ["Reading", ["Dune"]],
      ["Playing", ["Hades"]],
      ["Listening", ["Blue"]],
    ],
  );
});

test("keeps the order the caller sorted the entries into", () => {
  const shelves = popfeedShelves([
    entry("Newer", "book"),
    entry("Older", "book"),
  ]);
  assert.deepEqual(
    shelves[0].items.map((i) => i.title),
    ["Newer", "Older"],
  );
});

test("drops empty shelves and types no shelf collects", () => {
  const shelves = popfeedShelves([
    entry("Serial", "podcast"),
    entry("Untyped"),
  ]);
  assert.deepEqual(shelves, []);
});

test("returns no shelves for an empty feed", () => {
  assert.deepEqual(popfeedShelves([]), []);
});
