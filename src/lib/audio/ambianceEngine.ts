/**
 * ambianceEngine.ts — the generative background soundscape.
 *
 * Everything here is synthesised in the browser with the Web Audio API —
 * no audio files are shipped. A drone pad is built from two overlapping
 * "sabbat chords" (the current Sabbat and the one it is turning into),
 * cross-faded by exactly the same `getSabbatContext` progress value that
 * drives the site's colour theme, so the music and the palette turn the
 * Wheel of the Year together and never jump or click.
 *
 * The pad's root notes trace an arc across the eight Sabbats — low and
 * grounded at Yule, rising to its brightest at Litha — using the major
 * pentatonic degrees implied by each Sabbat's position on the wheel.
 *
 * On top of the seasonal drone, a few lightweight "what's happening on
 * the page right now" inputs nudge the sound in real time: scrolling
 * stirs a filtered-noise texture, reading a long page calms it back
 * down, the time of day brightens or dims the tone, and the "wolf mode"
 * Easter egg adds a low, wild undertone. All parameter changes are
 * ramped (`setTargetAtTime`) so nothing ever pops or clicks.
 */

import type { Sabbat } from "$lib/utils/sabbats";
import { getSabbatContext, getTargetHues } from "$lib/utils/theme";

// ── Musical mapping ──────────────────────────────────────────────────

// Root frequency for the drone (roughly A1) — deep enough to sit
// underneath the page without competing with anything else.
const ROOT_HZ = 55;

// Major-pentatonic-style semitone offsets, indexed exactly like
// `sabbats`, tracing an arc that peaks at Litha (midsummer) and
// bottoms out at Yule (midwinter) before rising again into Imbolc.
const SABBAT_SEMITONES: Record<string, number> = {
  Imbolc: 2,
  Ostara: 4,
  Beltane: 7,
  Litha: 9,
  Lughnasadh: 7,
  Mabon: 4,
  Samhain: 2,
  Yule: 0,
};

function semitoneOf(sabbat: Sabbat): number {
  return SABBAT_SEMITONES[sabbat.name] ?? 0;
}

function noteHz(rootHz: number, semitones: number): number {
  return rootHz * Math.pow(2, semitones / 12);
}

// A single drone "chord" is a root, a fifth, and an octave above the root.
function chordHz(sabbat: Sabbat): [number, number, number] {
  const root = noteHz(ROOT_HZ, semitoneOf(sabbat));
  return [root, noteHz(root, 7), noteHz(root, 12)];
}

// ── Small helpers ────────────────────────────────────────────────────

const SMOOTH_S = 4; // default AudioParam ramp time constant

function ramp(
  param: AudioParam,
  value: number,
  ctx: AudioContext,
  timeConstant = SMOOTH_S,
) {
  param.setTargetAtTime(value, ctx.currentTime, timeConstant);
}

function makeNoiseBuffer(ctx: AudioContext, seconds = 4): AudioBuffer {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

// A short synthetic impulse response gives a soft algorithmic reverb
// without shipping a sample file.
function makeImpulseResponse(
  ctx: AudioContext,
  seconds = 2.5,
  decay = 3,
): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * seconds);
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return impulse;
}

interface ChordVoice {
  gain: GainNode;
  filter: BiquadFilterNode;
  oscillators: OscillatorNode[];
}

/**
 * Owns one AudioContext and the whole node graph. Constructed lazily,
 * on the user gesture that first enables the ambiance, so the browser's
 * autoplay policy is always satisfied.
 */
export class AmbianceEngine {
  private ctx: AudioContext;
  private master: GainNode;
  private dry: GainNode;
  private wet: GainNode;
  private reverb: ConvolverNode;
  private brightness: BiquadFilterNode;

  private voiceA: ChordVoice;
  private voiceB: ChordVoice;
  private currentSabbatName: string | null = null;

  private noiseSource: AudioBufferSourceNode;
  private noiseFilter: BiquadFilterNode;
  private noiseGain: GainNode;

  private wildGain: GainNode;
  private wildOsc: OscillatorNode;
  private wildLfo: OscillatorNode;
  private wildLfoGain: GainNode;

  private breathLfo: OscillatorNode;
  private breathDepth: GainNode;

  private disposed = false;
  private targetVolume = 0.5;
  private activity = 0; // 0..1 scroll/reading activity
  private focusMode = false; // calmer while reading long-form content
  private reducedMotion = false;

  constructor() {
    const ctx = new AudioContext();
    this.ctx = ctx;

    this.master = ctx.createGain();
    this.master.gain.value = 0; // fades in via setVolume()
    this.master.connect(ctx.destination);

    this.brightness = ctx.createBiquadFilter();
    this.brightness.type = "lowpass";
    this.brightness.frequency.value = 1400;
    this.brightness.connect(this.master);

    this.dry = ctx.createGain();
    this.dry.gain.value = 0.75;
    this.dry.connect(this.brightness);

    this.wet = ctx.createGain();
    this.wet.gain.value = 0.35;
    this.reverb = ctx.createConvolver();
    this.reverb.buffer = makeImpulseResponse(ctx);
    this.wet.connect(this.reverb);
    this.reverb.connect(this.brightness);

    this.voiceA = this.createChordVoice();
    this.voiceB = this.createChordVoice();
    this.voiceB.gain.gain.value = 0; // silent until a transition begins

    // Slow "breathing" LFO modulating the overall pad level.
    this.breathLfo = ctx.createOscillator();
    this.breathLfo.frequency.value = 0.06;
    this.breathDepth = ctx.createGain();
    this.breathDepth.gain.value = 0.05;
    this.breathLfo.connect(this.breathDepth);
    this.breathDepth.connect(this.dry.gain);
    this.breathDepth.connect(this.wet.gain);
    this.breathLfo.start();

    // Filtered-noise texture, reacting to page activity.
    this.noiseSource = ctx.createBufferSource();
    this.noiseSource.buffer = makeNoiseBuffer(ctx);
    this.noiseSource.loop = true;
    this.noiseFilter = ctx.createBiquadFilter();
    this.noiseFilter.type = "bandpass";
    this.noiseFilter.frequency.value = 900;
    this.noiseFilter.Q.value = 0.7;
    this.noiseGain = ctx.createGain();
    this.noiseGain.gain.value = 0;
    this.noiseSource.connect(this.noiseFilter);
    this.noiseFilter.connect(this.noiseGain);
    this.noiseGain.connect(this.dry);
    this.noiseGain.connect(this.wet);
    this.noiseSource.start();

    // "Wolf mode" undertone — a slow, filtered howl-like sweep, silent
    // until the Easter egg is toggled on.
    this.wildGain = ctx.createGain();
    this.wildGain.gain.value = 0;
    this.wildOsc = ctx.createOscillator();
    this.wildOsc.type = "sawtooth";
    this.wildOsc.frequency.value = noteHz(ROOT_HZ, -12);
    const wildFilter = ctx.createBiquadFilter();
    wildFilter.type = "lowpass";
    wildFilter.frequency.value = 220;
    wildFilter.Q.value = 4;
    this.wildLfo = ctx.createOscillator();
    this.wildLfo.frequency.value = 0.08;
    this.wildLfoGain = ctx.createGain();
    this.wildLfoGain.gain.value = 120;
    this.wildLfo.connect(this.wildLfoGain);
    this.wildLfoGain.connect(wildFilter.frequency);
    this.wildOsc.connect(wildFilter);
    wildFilter.connect(this.wildGain);
    this.wildGain.connect(this.dry);
    this.wildGain.connect(this.wet);
    this.wildOsc.start();
    this.wildLfo.start();
  }

  private createChordVoice(): ChordVoice {
    const ctx = this.ctx;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    filter.connect(gain);
    gain.connect(this.dry);
    gain.connect(this.wet);

    const oscillators = [0, 1, 2].map((i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? "sine" : "triangle";
      // A hair of detune per oscillator gives the drone a natural chorus.
      osc.detune.value = (i - 1) * 4;
      osc.connect(filter);
      osc.start();
      return osc;
    });

    return { gain, filter, oscillators };
  }

  private setChord(voice: ChordVoice, sabbat: Sabbat) {
    const [root, fifth, octave] = chordHz(sabbat);
    const freqs = [root, fifth, octave];
    voice.oscillators.forEach((osc, i) =>
      ramp(osc.frequency, freqs[i], this.ctx, 6),
    );
  }

  /** Resume the context (needed after a user gesture) and fade the pad in. */
  async start(volume: number) {
    if (this.disposed) return;
    if (this.ctx.state === "suspended") await this.ctx.resume();
    this.targetVolume = volume;
    ramp(this.master.gain, volume, this.ctx, 2.5);
  }

  /** Fade the pad out; leaves the graph running (cheap) so start() is instant. */
  stop() {
    if (this.disposed) return;
    ramp(this.master.gain, 0, this.ctx, 2.5);
  }

  /** Fully suspend the context, e.g. when the tab is hidden. */
  async suspend() {
    if (this.disposed || this.ctx.state !== "running") return;
    await this.ctx.suspend();
  }

  async resume() {
    if (this.disposed || this.ctx.state !== "suspended") return;
    await this.ctx.resume();
  }

  setVolume(volume: number) {
    this.targetVolume = volume;
    ramp(this.master.gain, volume, this.ctx, 2.5);
  }

  /** 0 (still) .. 1 (very active) — driven by scroll speed. */
  setActivity(value: number) {
    this.activity = Math.max(0, Math.min(1, value));
    this.applyTexture();
  }

  /** Calmer texture while reading a long page (e.g. a blog post). */
  setFocusMode(active: boolean) {
    this.focusMode = active;
    this.applyTexture();
  }

  setReducedMotion(reduced: boolean) {
    this.reducedMotion = reduced;
    ramp(this.breathDepth.gain, reduced ? 0.02 : 0.05, this.ctx, 3);
    ramp(this.wildLfoGain.gain, reduced ? 40 : 120, this.ctx, 3);
  }

  private applyTexture() {
    const ceiling = this.focusMode ? 0.03 : 0.09;
    const level = ceiling * this.activity;
    ramp(this.noiseGain.gain, level, this.ctx, 1.5);
    ramp(this.noiseFilter.frequency, 500 + this.activity * 2200, this.ctx, 1.5);
  }

  /** The "wolf mode" Easter egg — a wild, low undertone. */
  setWildMode(active: boolean) {
    ramp(this.wildGain.gain, active ? 0.05 : 0, this.ctx, 3);
  }

  /**
   * Called periodically (and once at startup) to move the drone toward
   * the current point on the Wheel of the Year and the time of day.
   * Everything here is a slow ramp, so calling it every few minutes is
   * plenty — the transition itself is inaudible in progress.
   */
  update(now: Date = new Date()) {
    const { prev, next, progress } = getSabbatContext(now);

    if (this.currentSabbatName !== prev.name) {
      this.setChord(this.voiceA, prev);
      this.currentSabbatName = prev.name;
    }
    this.setChord(this.voiceB, next);

    ramp(this.voiceA.gain.gain, 0.16 * (1 - progress), this.ctx, 90);
    ramp(this.voiceB.gain.gain, 0.16 * progress, this.ctx, 90);

    // Time of day: brighter filter by day, darker and warmer by night.
    // Peaks at noon, near zero at dawn/dusk, clamped to zero overnight.
    const hour = now.getHours() + now.getMinutes() / 60;
    const daylight = Math.max(0, Math.sin(((hour - 6) / 24) * Math.PI * 2));
    const cutoff = 700 + daylight * 1400;
    ramp(this.brightness.frequency, cutoff, this.ctx, 60);

    // The continuously-interpolated theme hue nudges chord brightness too,
    // so the sound keeps drifting even between Sabbat transitions.
    const [primaryHue] = getTargetHues(now);
    const hueBrightness = 500 + (primaryHue / 360) * 900;
    ramp(this.voiceA.filter.frequency, hueBrightness, this.ctx, 60);
    ramp(this.voiceB.filter.frequency, hueBrightness, this.ctx, 60);
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    try {
      this.ctx.close();
    } catch {
      // Already closed — nothing to do.
    }
  }
}
