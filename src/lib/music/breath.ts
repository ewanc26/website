/**
 * breath.ts — the slow "breathing" LFO that modulates the whole pad's
 * level, so it swells and settles instead of sitting at a flat volume.
 */

import { ramp } from "./ramp";
import type { AudioBuses } from "./types";

export interface BreathLayer {
  setReducedMotion(reduced: boolean): void;
}

export function createBreathLayer(buses: AudioBuses): BreathLayer {
  const { ctx, dry, wet } = buses;

  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.06;
  const depth = ctx.createGain();
  depth.gain.value = 0.05;
  lfo.connect(depth);
  depth.connect(dry.gain);
  depth.connect(wet.gain);
  lfo.start();

  return {
    setReducedMotion(reduced) {
      ramp(depth.gain, reduced ? 0.02 : 0.05, ctx, 3);
    },
  };
}
