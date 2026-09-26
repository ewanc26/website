/**
 * melodies.ts — eight short, original melodic loops, one per Sabbat.
 *
 * These are new compositions written for this project, not arrangements
 * or excerpts of any existing work, and are dedicated to the public
 * domain (CC0 1.0): use them however you like, on this site or
 * anywhere else, with no attribution required.
 *
 * Every note is drawn from the same three-octave major-pentatonic set
 * the rest of the engine already uses (chordVoice.ts, chime.ts) —
 * degrees 0, 2, 4, 7, 9 repeated across the octave below and the
 * octave above — so whichever Sabbat is playing, the melody always
 * sits consonant against the drone and the generative chimes under
 * it. `null` is a rest. All eight share one fixed 8-step grid (see
 * MELODY_STEP_SECONDS in melody.ts) so two of them can play back to
 * back, or cross-fade into one another, without ever falling out of
 * rhythm.
 */

import type { Sabbat } from "$lib/utils/sabbats";

export type MelodyStep = number | null;

export const SABBAT_MELODIES: Record<Sabbat["name"], MelodyStep[]> = {
  // First stirrings of spring: a simple, hopeful line, rising step by step.
  Imbolc: [0, null, 2, null, 4, null, 7, 12],
  // The equinox: a balanced, even-tempered arch, up and back down.
  Ostara: [0, 4, 2, 7, 4, 9, 7, 4],
  // Beltane's fires: the most active line of the eight — leaping, full.
  Beltane: [0, 7, 4, 12, 9, 14, 7, 4],
  // Midsummer's height: the highest register, spacious and sustained.
  Litha: [12, null, 16, null, 19, null, 14, 9],
  // First harvest: warm and grounded, gently gathering back down.
  Lughnasadh: [9, 7, 9, 4, 7, 2, 4, 0],
  // Second harvest: reflective and falling, more space between notes.
  Mabon: [7, 4, 2, null, 4, 0, null, -3],
  // The veil thins: sparse and low, mostly silence.
  Samhain: [null, -5, null, 0, null, -3, null, -8],
  // The longest night: nearly still, resolving on the root as the light returns.
  Yule: [-8, null, null, -5, null, null, 0, null],
};
