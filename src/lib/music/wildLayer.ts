/**
 * wildLayer.ts — the "wolf mode" Easter egg undertone: a low, slowly
 * swept, filtered growl that fades in only while wolf mode is active.
 */

import { ROOT_HZ } from "./constants";
import { noteHz } from "./notes";
import { ramp } from "./ramp";
import type { AudioBuses } from "./types";

export interface WildLayer {
  setActive(active: boolean): void;
  setReducedMotion(reduced: boolean): void;
  /** Track the drone's current root so the growl stays in key with it
   *  across the year, instead of sitting fixed at one Sabbat's pitch. */
  setRootHz(hz: number): void;
}

export function createWildLayer(buses: AudioBuses): WildLayer {
  const { ctx, dry, wet } = buses;

  const gain = ctx.createGain();
  gain.gain.value = 0;

  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.value = noteHz(ROOT_HZ, -12);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 220;
  filter.Q.value = 4;

  const sweepLfo = ctx.createOscillator();
  sweepLfo.frequency.value = 0.08;
  const sweepDepth = ctx.createGain();
  sweepDepth.gain.value = 120;
  sweepLfo.connect(sweepDepth);
  sweepDepth.connect(filter.frequency);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(dry);
  gain.connect(wet);

  osc.start();
  sweepLfo.start();

  return {
    setActive(active) {
      ramp(gain.gain, active ? 0.05 : 0, ctx, 3);
    },
    setReducedMotion(reduced) {
      ramp(sweepDepth.gain, reduced ? 40 : 120, ctx, 3);
    },
    setRootHz(hz) {
      ramp(osc.frequency, hz / 2, ctx, 6);
    },
  };
}
