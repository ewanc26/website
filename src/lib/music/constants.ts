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

// A flat random pick across those degrees has no melodic contour —
// every note is equally likely to follow any other, which reads as
// aimless. Weighting the root, fifth, and octave (indices 0, 3, 5)
// more heavily gives the line somewhere to "land", the same intuition
// behind a Markov chain's transition weights, without needing one.
export const CHIME_WEIGHTS = [3, 1, 1, 2, 1, 2, 1, 1, 1];

// FM ratios that read as bell-like (inharmonic but not clangorous).
export const CHIME_RATIOS = [2, 3, 3.5, 4];

// Real FM synths taper both the modulation index and the modulator
// ratio down for higher notes ("keyboard scaling"). A Web Audio
// oscillator driven by an audio-rate FM signal computes true
// instantaneous frequency with no anti-aliasing of its own, so the
// same *relative* brightness that reads as a warm bell at a low
// carrier can push sidebands past Nyquist — audible aliasing — at a
// high one. FM_INDEX_TAPER_HZ scales the index down above that pitch;
// past FM_RATIO_MID_HZ and FM_RATIO_HIGH_HZ, the ratio pool itself
// narrows to keep the absolute deviation in check.
export const FM_INDEX_TAPER_HZ = 300;
export const FM_RATIO_MID_HZ = 400;
export const FM_RATIO_HIGH_HZ = 700;

// Default AudioParam ramp time constant.
export const SMOOTH_S = 4;
