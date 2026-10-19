/**
 * Groups Popfeed reviews into the homepage shelves. Kept free of PDS and
 * cache imports so it can be unit-tested directly (see popfeedShelves.test.ts).
 */

import type { PopfeedEntry } from "./popfeed";

/**
 * Homepage shelves. `types` are the Popfeed `creativeWorkType` values a shelf
 * collects; `n` sizes the heading word to its length (see `.word` in riso.css).
 */
export const POPFEED_SHELVES = [
  { word: "Watching", verb: "watch", n: 8, types: ["movie", "tv_show"] },
  { word: "Reading", verb: "read", n: 7, types: ["book"] },
  { word: "Playing", verb: "play", n: 7, types: ["game"] },
  { word: "Listening", verb: "listen", n: 9, types: ["album"] },
];

export interface PopfeedShelf {
  word: string;
  verb: string;
  n: number;
  items: PopfeedEntry[];
}

/** Splits reviews into the homepage shelves, dropping shelves with nothing in them. */
export function popfeedShelves(entries: PopfeedEntry[]): PopfeedShelf[] {
  return POPFEED_SHELVES.map((shelf) => ({
    word: shelf.word,
    verb: shelf.verb,
    n: shelf.n,
    items: entries.filter(
      (e) => e.creativeWorkType && shelf.types.includes(e.creativeWorkType),
    ),
  })).filter((shelf) => shelf.items.length > 0);
}
