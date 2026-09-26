/**
 * chime.ts — the generative layer, built the way Brian Eno built
 * "Music for Airports": independent, self-rescheduling loops with
 * randomised, non-matching intervals, each dropping a single note.
 * No two firings ever line up the same way, so the piece never
 * audibly repeats even though it's built from a handful of fixed
 * parts (one FM-bell voice, one pentatonic scale). Notes are a
 * weighted pick over that scale rather than flat-random, favouring the
 * root/fifth/octave as places for the line to land, and never
 * repeating the previous note — the same intuition as a Markov
 * chain's transition weights, without the overhead of one.
 *
 * Density and brightness lean on the real Moon phase — the same
 * lunar calculation the site's footer already shows — so a fuller
 * Moon rings brighter and more often.
 */

import {
  CHIME_DEGREES,
  CHIME_RATIOS,
  CHIME_WEIGHTS,
  FM_INDEX_TAPER_HZ,
  FM_RATIO_HIGH_HZ,
  FM_RATIO_MID_HZ,
} from "./constants";
import { noteHz } from "./notes";
import { randomBetween } from "./ramp";
import type { AudioBuses } from "./types";

const CHIME_WEIGHT_TOTAL = CHIME_WEIGHTS.reduce((sum, w) => sum + w, 0);

/** A weighted pick, excluding the immediately previous note so the line
 *  doesn't stall on a repeat — a lightweight stand-in for a Markov
 *  chain's "don't return to the same state" rule. */
function pickDegreeIndex(excludeIndex: number | null): number {
  let index: number;
  do {
    let r = Math.random() * CHIME_WEIGHT_TOTAL;
    index = CHIME_WEIGHTS.length - 1;
    for (let i = 0; i < CHIME_WEIGHTS.length; i++) {
      r -= CHIME_WEIGHTS[i];
      if (r <= 0) {
        index = i;
        break;
      }
    }
  } while (index === excludeIndex);
  return index;
}

/** Keyboard-scale the ratio pool: fewer, simpler ratios as the note
 *  climbs, so the modulator frequency (and its sidebands) stay in check. */
function ratioPoolFor(freq: number): number[] {
  if (freq > FM_RATIO_HIGH_HZ) return [2];
  if (freq > FM_RATIO_MID_HZ) return [2, 3];
  return CHIME_RATIOS;
}

export interface ChimeLayer {
  setRunning(running: boolean): void;
  setActivity(value: number): void;
  setFocusMode(active: boolean): void;
  setReducedMotion(reduced: boolean): void;
  setResting(resting: boolean): void;
  setMoonFraction(fraction: number): void;
  setRootHz(hz: number): void;
  /** Play one bright, immediate note as feedback for a real interaction
   *  (a comment published, a link copied) — bypasses the schedule. */
  pulse(): void;
  dispose(): void;
}

interface PlayOptions {
  registerBoost?: number;
  ampBoost?: number;
}

/** Starts the loop immediately; it reschedules itself until disposed. */
export function createChimeLayer(buses: AudioBuses): ChimeLayer {
  const { ctx, dry, wet } = buses;

  let running = false;
  let disposed = false;
  let activity = 0;
  let focusMode = false;
  let reducedMotion = false;
  let resting = false;
  let moonFraction = 0.5;
  let rootHz = 55;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastDegreeIndex: number | null = null;

  function scheduleNext() {
    if (disposed) return;
    const base = reducedMotion ? 20 : 16;
    const busyPenalty = activity * 6;
    const moonBonus = moonFraction * 4;
    // Left undisturbed for a while, the piece opens up and volunteers
    // more of itself — the same instinct behind a screensaver blooming.
    const restingBonus = resting ? 3 : 0;
    // However bright the Moon or restful the moment, never so dense that
    // the chimes stop being "ignorable" background and start demanding
    // attention — Eno's own bar for Music for Airports.
    const mean = Math.max(9, base + busyPenalty - moonBonus - restingBonus);
    const delaySeconds = randomBetween(mean * 0.7, mean * 1.5);
    timer = setTimeout(() => {
      play();
      scheduleNext();
    }, delaySeconds * 1000);
  }

  function play(options: PlayOptions = {}) {
    if (!running || disposed) return;
    const now = ctx.currentTime;

    const degreeIndex = pickDegreeIndex(lastDegreeIndex);
    lastDegreeIndex = degreeIndex;
    const degree = CHIME_DEGREES[degreeIndex];
    const registerLift =
      24 + Math.round(moonFraction * 12) + (options.registerBoost ?? 0);
    const freq = noteHz(rootHz, degree + registerLift);
    const ratioPool = ratioPoolFor(freq);
    const ratio = ratioPool[Math.floor(Math.random() * ratioPool.length)];

    const carrier = ctx.createOscillator();
    carrier.type = "sine";
    carrier.frequency.value = freq;

    const modulator = ctx.createOscillator();
    modulator.type = "sine";
    modulator.frequency.value = freq * ratio;

    // The FM modulation index (peak frequency deviation / modulator
    // frequency) is what actually decides whether this reads as a bell:
    // below ~1 it's just vibrato, and only ~5 and up gives that bright,
    // metallic strike. Hit it hard at the onset, then collapse it almost
    // to nothing within half a second so the tail rings clean rather
    // than staying harsh — a fuller Moon strikes a little harder.
    // The index itself is keyboard-scaled down for higher notes, in step
    // with the ratio pool above, for the same anti-aliasing reason.
    const modIndex = ctx.createGain();
    const modulatorHz = freq * ratio;
    const registerTaper = Math.min(1, FM_INDEX_TAPER_HZ / freq);
    const indexPeak = (4 + moonFraction * 3) * registerTaper;
    const peakIndex = indexPeak * modulatorHz;
    modIndex.gain.setValueAtTime(peakIndex, now);
    modIndex.gain.exponentialRampToValueAtTime(
      Math.max(1, modulatorHz * 0.03),
      now + 0.35,
    );
    modulator.connect(modIndex);
    modIndex.connect(carrier.frequency);

    const amp = ctx.createGain();
    const peakAmp =
      (focusMode ? 0.035 : 0.05) +
      moonFraction * 0.02 +
      (options.ampBoost ?? 0);
    const decay = resting ? randomBetween(4, 7) : randomBetween(2.5, 5);
    amp.gain.setValueAtTime(0, now);
    amp.gain.linearRampToValueAtTime(peakAmp, now + 0.02);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + decay);

    const pan = ctx.createStereoPanner();
    pan.pan.value = randomBetween(-0.8, 0.8);

    const dryTap = ctx.createGain();
    dryTap.gain.value = 0.2;

    carrier.connect(amp);
    amp.connect(pan);
    pan.connect(wet);
    pan.connect(dryTap);
    dryTap.connect(dry);

    const stopAt = now + decay + 0.2;
    carrier.start(now);
    modulator.start(now);
    carrier.stop(stopAt);
    modulator.stop(stopAt);
    carrier.onended = () => {
      carrier.disconnect();
      modulator.disconnect();
      modIndex.disconnect();
      amp.disconnect();
      pan.disconnect();
      dryTap.disconnect();
    };
  }

  scheduleNext();

  return {
    setRunning(value) {
      running = value;
    },
    setActivity(value) {
      activity = Math.max(0, Math.min(1, value));
    },
    setFocusMode(active) {
      focusMode = active;
    },
    setReducedMotion(reduced) {
      reducedMotion = reduced;
    },
    setResting(value) {
      resting = value;
    },
    setMoonFraction(fraction) {
      moonFraction = fraction;
    },
    setRootHz(hz) {
      rootHz = hz;
    },
    pulse() {
      play({ registerBoost: 5, ampBoost: 0.02 });
    },
    dispose() {
      disposed = true;
      if (timer !== null) clearTimeout(timer);
    },
  };
}
