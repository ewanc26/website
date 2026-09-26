/**
 * chordVoice.ts — one drone "chord": a root, a fifth, and an octave,
 * plus a low sub-oscillator for body.
 *
 * Each oscillator gets its own slow detune LFO running at a rate
 * unrelated to the others' — "conflicting cycles" — so the chorus
 * keeps drifting instead of settling into an audible loop. A slow
 * autopan gives the voice width without ever feeling like a
 * mechanical sweep.
 */

import type { Sabbat } from "$lib/utils/sabbats";
import { chordHz } from "./notes";
import { ramp } from "./ramp";
import type { AudioBuses, ChordVoice, DetuneLfo } from "./types";

function attachDetuneLfo(
  ctx: AudioContext,
  osc: OscillatorNode,
  rateHz: number,
  registry: DetuneLfo[],
) {
  const lfo = ctx.createOscillator();
  lfo.frequency.value = rateHz;
  const depth = ctx.createGain();
  depth.gain.value = 6; // cents
  lfo.connect(depth);
  depth.connect(osc.detune);
  lfo.start();
  registry.push({ osc: lfo, depth });
}

/**
 * Build one chord voice wired into `buses`. `panLfoRateHz` should differ
 * between voices so their autopans never sync up. Any detune LFOs it
 * creates are pushed onto `detuneLfos` so the engine can adjust their
 * depth later (e.g. for prefers-reduced-motion).
 */
export function createChordVoice(
  buses: AudioBuses,
  panLfoRateHz: number,
  detuneLfos: DetuneLfo[],
): ChordVoice {
  const { ctx, dry, wet } = buses;

  const gain = ctx.createGain();
  gain.gain.value = 0;
  const pan = ctx.createStereoPanner();
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 900;
  filter.connect(pan);
  pan.connect(gain);
  gain.connect(dry);
  gain.connect(wet);

  const panLfo = ctx.createOscillator();
  panLfo.frequency.value = panLfoRateHz;
  const panDepth = ctx.createGain();
  panDepth.gain.value = 0.35;
  panLfo.connect(panDepth);
  panDepth.connect(pan.pan);
  panLfo.start();

  const oscillators = [0, 1, 2].map((i) => {
    const osc = ctx.createOscillator();
    osc.type = i === 0 ? "sine" : "triangle";
    osc.connect(filter);
    osc.start();
    attachDetuneLfo(ctx, osc, panLfoRateHz * 1.3 + i * 0.017, detuneLfos);
    return osc;
  });

  // A heavily low-passed sub an octave below the root, for body and
  // weight without muddying the chord above it.
  const subFilter = ctx.createBiquadFilter();
  subFilter.type = "lowpass";
  subFilter.frequency.value = 180;
  subFilter.connect(pan);
  const sub = ctx.createOscillator();
  sub.type = "sawtooth";
  sub.connect(subFilter);
  sub.start();

  return { gain, filter, pan, oscillators, sub };
}

/** Ramp a chord voice's pitches toward the given Sabbat's chord. */
export function setChord(ctx: AudioContext, voice: ChordVoice, sabbat: Sabbat) {
  const [root, fifth, octave] = chordHz(sabbat);
  const freqs = [root, fifth, octave];
  voice.oscillators.forEach((osc, i) => ramp(osc.frequency, freqs[i], ctx, 6));
  ramp(voice.sub.frequency, root / 2, ctx, 6);
}
