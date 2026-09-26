/**
 * noiseTexture.ts — a filtered-noise "air" layer that reacts to page
 * activity: it stirs when the visitor scrolls and settles back into
 * quiet stillness, more so while they're reading long-form content.
 */

import { makeNoiseBuffer } from "./buffers";
import { ramp } from "./ramp";
import type { AudioBuses } from "./types";

export interface NoiseTexture {
  setActivity(value: number): void;
  setFocusMode(active: boolean): void;
}

export function createNoiseTexture(buses: AudioBuses): NoiseTexture {
  const { ctx, dry, wet } = buses;

  const source = ctx.createBufferSource();
  source.buffer = makeNoiseBuffer(ctx);
  source.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 900;
  filter.Q.value = 0.7;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(dry);
  gain.connect(wet);
  source.start();

  let activity = 0;
  let focusMode = false;

  function apply() {
    const ceiling = focusMode ? 0.03 : 0.09;
    ramp(gain.gain, ceiling * activity, ctx, 1.5);
    ramp(filter.frequency, 500 + activity * 2200, ctx, 1.5);
  }

  return {
    setActivity(value) {
      activity = Math.max(0, Math.min(1, value));
      apply();
    },
    setFocusMode(active) {
      focusMode = active;
      apply();
    },
  };
}
