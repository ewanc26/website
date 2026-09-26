/**
 * chime.ts — the generative layer, built the way Brian Eno built
 * "Music for Airports": independent, self-rescheduling loops with
 * randomised, non-matching intervals, each dropping a single note.
 * No two firings ever line up the same way, so the piece never
 * audibly repeats even though it's built from a handful of fixed
 * parts (one FM-bell voice, one pentatonic scale).
 *
 * Density and brightness lean on the real Moon phase — the same
 * lunar calculation the site's footer already shows — so a fuller
 * Moon rings brighter and more often.
 */

import { CHIME_DEGREES, CHIME_RATIOS } from "./constants";
import { noteHz } from "./notes";
import { randomBetween } from "./ramp";
import type { AudioBuses } from "./types";

export interface ChimeLayer {
  setRunning(running: boolean): void;
  setActivity(value: number): void;
  setFocusMode(active: boolean): void;
  setReducedMotion(reduced: boolean): void;
  setMoonFraction(fraction: number): void;
  setRootHz(hz: number): void;
  dispose(): void;
}

/** Starts the loop immediately; it reschedules itself until disposed. */
export function createChimeLayer(buses: AudioBuses): ChimeLayer {
  const { ctx, dry, wet } = buses;

  let running = false;
  let disposed = false;
  let activity = 0;
  let focusMode = false;
  let reducedMotion = false;
  let moonFraction = 0.5;
  let rootHz = 55;
  let timer: ReturnType<typeof setTimeout> | null = null;

  function scheduleNext() {
    if (disposed) return;
    const base = reducedMotion ? 15 : 10;
    const busyPenalty = activity * 6;
    const moonBonus = moonFraction * 4;
    const mean = Math.max(4, base + busyPenalty - moonBonus);
    const delaySeconds = randomBetween(mean * 0.6, mean * 1.6);
    timer = setTimeout(() => {
      play();
      scheduleNext();
    }, delaySeconds * 1000);
  }

  function play() {
    if (!running || disposed) return;
    const now = ctx.currentTime;

    const degree =
      CHIME_DEGREES[Math.floor(Math.random() * CHIME_DEGREES.length)];
    const registerLift = 24 + Math.round(moonFraction * 12);
    const freq = noteHz(rootHz, degree + registerLift);
    const ratio = CHIME_RATIOS[Math.floor(Math.random() * CHIME_RATIOS.length)];

    const carrier = ctx.createOscillator();
    carrier.type = "sine";
    carrier.frequency.value = freq;

    const modulator = ctx.createOscillator();
    modulator.type = "sine";
    modulator.frequency.value = freq * ratio;

    // A fast-decaying modulation index gives the classic FM-bell
    // "bright attack, mellow tail" without a sample.
    const modIndex = ctx.createGain();
    const peakIndex = freq * (1.1 + moonFraction * 0.6);
    modIndex.gain.setValueAtTime(peakIndex, now);
    modIndex.gain.exponentialRampToValueAtTime(
      Math.max(1, peakIndex * 0.02),
      now + 0.6,
    );
    modulator.connect(modIndex);
    modIndex.connect(carrier.frequency);

    const amp = ctx.createGain();
    const peakAmp = (focusMode ? 0.035 : 0.05) + moonFraction * 0.02;
    const decay = randomBetween(2.5, 5);
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
    setMoonFraction(fraction) {
      moonFraction = fraction;
    },
    setRootHz(hz) {
      rootHz = hz;
    },
    dispose() {
      disposed = true;
      if (timer !== null) clearTimeout(timer);
    },
  };
}
