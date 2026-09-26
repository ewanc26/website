/**
 * constants.ts — fixed numbers the rest of `music/` is built on.
 *
 * Nothing in this file does anything by itself; it's the shared tuning
 * table the notes, chord-voice, and chime layers all read from.
 */

import type { Sabbat } from "$lib/utils/sabbats";

// Root frequency for the drone (roughly A1) — deep enough to sit
// underneath the page without competing with anything else.
export const ROOT_HZ = 55;

// Major-pentatonic-style semitone offsets, indexed by Sabbat name,
// tracing an arc that peaks at Litha (midsummer) and bottoms out at
// Yule (midwinter) before rising again into Imbolc.
export const SABBAT_SEMITONES: Record<Sabbat["name"], number> = {
  Imbolc: 2,
  Ostara: 4,
  Beltane: 7,
  Litha: 9,
  Lughnasadh: 7,
  Mabon: 4,
  Samhain: 2,
  Yule: 0,
};

// Degrees the chime layer picks from, relative to the current root —
// a two-octave major pentatonic so notes always sit consonant against
// the drone underneath them.
export const CHIME_DEGREES = [0, 2, 4, 7, 9, 12, 14, 16, 19];

// FM ratios that read as bell-like (inharmonic but not clangorous).
export const CHIME_RATIOS = [2, 3, 3.5, 4];

// Default AudioParam ramp time constant.
export const SMOOTH_S = 4;
