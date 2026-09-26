/**
 * ambianceEngine.ts — the generative background soundscape.
 *
 * Everything here is synthesised in the browser with the Web Audio API —
 * no audio files are shipped. Two things anchor the design, both drawn
 * from how real generative ambient music is built:
 *
 * 1. Brian Eno's "Music for Airports" technique: several independent,
 *    unsynchronised loops of different, non-matching lengths, each
 *    dropping in a single note. No two loops line up the same way twice,
 *    so the piece never audibly repeats even though it's built from a
 *    handful of fixed parts. The chime layer below (`scheduleNextChime`)
 *    does the same thing with `setTimeout` instead of tape.
 * 2. "Conflicting cycles": several slow LFOs running at deliberately
 *    unrelated rates (irrational-ish, never a clean ratio of one
 *    another) so their combined effect on detune/pan/filtering keeps
 *    drifting instead of settling into an audible cycle.
 *
 * On top of that, a drone pad is built from two overlapping "sabbat
 * chords" (the current Sabbat and the one it is turning into),
 * cross-faded by exactly the same `getSabbatContext` progress value that
 * drives the site's colour theme, so the music and the palette turn the
 * Wheel of the Year together and never jump or click. The chime layer's
 * pitch, brightness, and density also track the real Moon phase — a
 * quiet nod to the same lunar cycle the footer already shows.
 *
 * A few lightweight "what's happening on the page right now" inputs
 * nudge the sound in real time: scrolling stirs a filtered-noise
 * texture, reading a long page calms it back down, the time of day
 * brightens or dims the tone, and the "wolf mode" Easter egg adds a
 * low, wild undertone. All parameter changes are ramped
 * (`setTargetAtTime`) so nothing ever pops or clicks.
 */

import type { Sabbat } from "$lib/utils/sabbats";
import { getSabbatContext, getTargetHues } from "$lib/utils/theme";
import { getMoonIllumination } from "$lib/utils/moonPhase";

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

// Degrees the chime layer picks from, relative to the current root —
// a two-octave major pentatonic so notes always sit consonant against
// the drone underneath them.
const CHIME_DEGREES = [0, 2, 4, 7, 9, 12, 14, 16, 19];

// FM ratios that read as bell-like (inharmonic but not clangorous).
const CHIME_RATIOS = [2, 3, 3.5, 4];

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

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
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
  seconds = 2.8,
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

interface DetuneLfo {
  osc: OscillatorNode;
  depth: GainNode;
}

interface ChordVoice {
  gain: GainNode;
  filter: BiquadFilterNode;
  pan: StereoPannerNode;
  oscillators: OscillatorNode[];
  sub: OscillatorNode;
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
  private activeRootHz = ROOT_HZ;

  private detuneLfos: DetuneLfo[] = [];

  private noiseSource: AudioBufferSourceNode;
  private noiseFilter: BiquadFilterNode;
  private noiseGain: GainNode;

  private wildGain: GainNode;
  private wildOsc: OscillatorNode;
  private wildLfo: OscillatorNode;
  private wildLfoGain: GainNode;

  private breathLfo: OscillatorNode;
  private breathDepth: GainNode;

  private chimeTimer: ReturnType<typeof setTimeout> | null = null;

  private disposed = false;
  private running = false;
  private activity = 0; // 0..1 scroll/reading activity
  private focusMode = false; // calmer while reading long-form content
  private reducedMotion = false;
  private moonFraction = 0.5; // current Moon illumination, 0..1

  constructor() {
    const ctx = new AudioContext();
    this.ctx = ctx;

    this.master = ctx.createGain();
    this.master.gain.value = 0; // fades in via start()/setVolume()
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

    this.voiceA = this.createChordVoice(0.061);
    this.voiceB = this.createChordVoice(0.083);
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

    // Kick off the Eno-style chime loop. It reschedules itself forever;
    // playChime() is a no-op while the ambiance is muted, so this costs
    // nothing when the visitor hasn't turned the sound on.
    this.scheduleNextChime();
  }

  private createChordVoice(panLfoRateHz: number): ChordVoice {
    const ctx = this.ctx;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    const pan = ctx.createStereoPanner();
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    filter.connect(pan);
    pan.connect(gain);
    gain.connect(this.dry);
    gain.connect(this.wet);

    // A slow, unhurried autopan gives the pad width without ever
    // feeling like a mechanical sweep.
    const panLfo = ctx.createOscillator();
    panLfo.frequency.value = panLfoRateHz;
    const panDepth = ctx.createGain();
    panDepth.gain.value = 0.35;
    panLfo.connect(panDepth);
    panDepth.connect(pan.pan);
    panLfo.start();

    // Three close-voiced oscillators (root/fifth/octave), each with its
    // own slow detune LFO running at a rate unrelated to the others' —
    // "conflicting cycles" so the chorus never locks into a loop.
    const oscillators = [0, 1, 2].map((i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? "sine" : "triangle";
      osc.connect(filter);
      osc.start();
      this.attachDetuneLfo(osc, panLfoRateHz * 1.3 + i * 0.017);
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

  private attachDetuneLfo(osc: OscillatorNode, rateHz: number) {
    const ctx = this.ctx;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = rateHz;
    const depth = ctx.createGain();
    depth.gain.value = 6; // cents
    lfo.connect(depth);
    depth.connect(osc.detune);
    lfo.start();
    this.detuneLfos.push({ osc: lfo, depth });
  }

  private setChord(voice: ChordVoice, sabbat: Sabbat) {
    const [root, fifth, octave] = chordHz(sabbat);
    const freqs = [root, fifth, octave];
    voice.oscillators.forEach((osc, i) =>
      ramp(osc.frequency, freqs[i], this.ctx, 6),
    );
    ramp(voice.sub.frequency, root / 2, this.ctx, 6);
  }

  /** Resume the context (needed after a user gesture) and fade the pad in. */
  async start(volume: number) {
    if (this.disposed) return;
    if (this.ctx.state === "suspended") await this.ctx.resume();
    this.running = true;
    ramp(this.master.gain, volume, this.ctx, 2.5);
  }

  /** Fade the pad out; leaves the graph running (cheap) so start() is instant. */
  stop() {
    if (this.disposed) return;
    this.running = false;
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
    const detuneDepth = reduced ? 2 : 6;
    for (const lfo of this.detuneLfos)
      ramp(lfo.depth.gain, detuneDepth, this.ctx, 3);
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
   * Eno-style generative chime: an independent loop with a randomised,
   * ever-different interval, so it never lines up with itself or with
   * the drone's own slow movement. Scrolling activity lengthens the
   * gaps (stay out of the way while the visitor is busy); a fuller
   * Moon shortens them and brightens the notes.
   */
  private scheduleNextChime() {
    if (this.disposed) return;
    const base = this.reducedMotion ? 15 : 10;
    const busyPenalty = this.activity * 6;
    const moonBonus = this.moonFraction * 4;
    const mean = Math.max(4, base + busyPenalty - moonBonus);
    const delaySeconds = randomBetween(mean * 0.6, mean * 1.6);
    this.chimeTimer = setTimeout(() => {
      this.playChime();
      this.scheduleNextChime();
    }, delaySeconds * 1000);
  }

  private playChime() {
    if (!this.running || this.disposed) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const degree =
      CHIME_DEGREES[Math.floor(Math.random() * CHIME_DEGREES.length)];
    const registerLift = 24 + Math.round(this.moonFraction * 12);
    const freq = noteHz(this.activeRootHz, degree + registerLift);
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
    const peakIndex = freq * (1.1 + this.moonFraction * 0.6);
    modIndex.gain.setValueAtTime(peakIndex, now);
    modIndex.gain.exponentialRampToValueAtTime(
      Math.max(1, peakIndex * 0.02),
      now + 0.6,
    );
    modulator.connect(modIndex);
    modIndex.connect(carrier.frequency);

    const amp = ctx.createGain();
    const peakAmp = (this.focusMode ? 0.035 : 0.05) + this.moonFraction * 0.02;
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
    pan.connect(this.wet);
    pan.connect(dryTap);
    dryTap.connect(this.dry);

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

  /**
   * Called periodically (and once at startup) to move the drone toward
   * the current point on the Wheel of the Year, the time of day, and
   * the real Moon phase. Everything here is a slow ramp, so calling it
   * every few minutes is plenty — the transition itself is inaudible
   * in progress.
   */
  update(now: Date = new Date()) {
    const { prev, next, progress } = getSabbatContext(now);

    if (this.currentSabbatName !== prev.name) {
      this.setChord(this.voiceA, prev);
      this.currentSabbatName = prev.name;
    }
    this.setChord(this.voiceB, next);
    this.activeRootHz = noteHz(
      ROOT_HZ,
      semitoneOf(progress < 0.5 ? prev : next),
    );

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

    // The real Moon phase — the same figure the footer already shows —
    // quietly governs how often and how brightly the chimes ring.
    this.moonFraction = getMoonIllumination(now).fraction;
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    if (this.chimeTimer !== null) clearTimeout(this.chimeTimer);
    try {
      this.ctx.close();
    } catch {
      // Already closed — nothing to do.
    }
  }
}
