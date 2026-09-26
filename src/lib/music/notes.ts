/**
 * notes.ts — pure musical-pitch math for the ambiance engine.
 *
 * No Web Audio objects here, just frequency arithmetic, so it can be
 * reasoned about (and tested) independently of any AudioContext.
 */

import type { Sabbat } from "$lib/utils/sabbats";
import { ROOT_HZ, SABBAT_SEMITONES } from "./constants";

export function semitoneOf(sabbat: Sabbat): number {
  return SABBAT_SEMITONES[sabbat.name] ?? 0;
}

export function noteHz(rootHz: number, semitones: number): number {
  return rootHz * Math.pow(2, semitones / 12);
}

/** A single drone "chord": a root, a fifth, and an octave above the root. */
export function chordHz(sabbat: Sabbat): [number, number, number] {
  const root = noteHz(ROOT_HZ, semitoneOf(sabbat));
  return [root, noteHz(root, 7), noteHz(root, 12)];
}
