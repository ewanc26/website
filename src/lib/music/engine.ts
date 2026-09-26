/**
 * engine.ts — composes the `music/` atoms into the ambiance engine.
 *
 * The pad is two overlapping "sabbat chords" (the current Sabbat and
 * the one it is turning into), cross-faded by exactly the same
 * `getSabbatContext` progress value that drives the site's colour
 * theme, so the music and the palette turn the Wheel of the Year
 * together and never jump or click.
 *
 * A composed melody (melody.ts / melodies.ts) plays over that pad,
 * cross-fading between each Sabbat's own original tune the same way —
 * the pad and chimes stay generative, but the melody is real, fixed,
 * intentional musical content, not a random pattern.
 *
 * Two more things keep it feeling alive rather than looped: `pulse()`
 * gives real interactions on the page (a comment published, a link
 * copied) an audible, immediate confirmation instead of waiting on the
 * generative schedule; `setResting()` lets the piece open up — more
 * reverb, slower and longer chimes — once the visitor stops scrolling,
 * moving the pointer, or typing, the same instinct behind a screensaver
 * blooming when left alone.
 *
 * Owns one AudioContext and the whole node graph. Constructed lazily,
 * on the user gesture that first enables the ambiance, so the
 * browser's autoplay policy is always satisfied.
 */

import { getSabbatContext, getTargetHues } from "$lib/utils/theme";
import { getMoonIllumination } from "$lib/utils/moonPhase";
import { ROOT_HZ } from "./constants";
import { createBreathLayer, type BreathLayer } from "./breath";
import { createChimeLayer, type ChimeLayer } from "./chime";
import { createChordVoice, setChord } from "./chordVoice";
import { createMelodyLayer, type MelodyLayer } from "./melody";
import { SABBAT_MELODIES } from "./melodies";
import { createNoiseTexture, type NoiseTexture } from "./noiseTexture";
import { createWildLayer, type WildLayer } from "./wildLayer";
import { makeImpulseResponse } from "./buffers";
import { noteHz, semitoneOf } from "./notes";
import { ramp } from "./ramp";
import type { AudioBuses, ChordVoice, DetuneLfo } from "./types";

export class AmbianceEngine {
  private ctx: AudioContext;
  private master: GainNode;
  private wet: GainNode;
  private brightness: BiquadFilterNode;

  private voiceA: ChordVoice;
  private voiceB: ChordVoice;
  private currentSabbatName: string | null = null;

  private detuneLfos: DetuneLfo[] = [];
  private breath: BreathLayer;
  private noise: NoiseTexture;
  private wild: WildLayer;
  private chime: ChimeLayer;
  private melody: MelodyLayer;

  private disposed = false;

  constructor() {
    const ctx = new AudioContext();
    this.ctx = ctx;

    this.master = ctx.createGain();
    this.master.gain.value = 0; // fades in via start()/setVolume()

    // A gentle bus limiter as insurance, not a sound of its own: several
    // independently-scheduled layers (drone, texture, chimes, pulses)
    // can occasionally stack, and this catches that overlap before it
    // ever turns into an audible crackle or clip.
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -18;
    limiter.knee.value = 12;
    limiter.ratio.value = 4;
    limiter.attack.value = 0.005;
    limiter.release.value = 0.25;
    this.master.connect(limiter);
    limiter.connect(ctx.destination);

    this.brightness = ctx.createBiquadFilter();
    this.brightness.type = "lowpass";
    this.brightness.frequency.value = 1400;
    this.brightness.connect(this.master);

    const dry = ctx.createGain();
    dry.gain.value = 0.75;
    dry.connect(this.brightness);

    this.wet = ctx.createGain();
    this.wet.gain.value = 0.35;
    // A short pre-delay keeps the reverb from smearing straight into
    // whatever triggered it — the dry attack (a chime's strike, a chord
    // change) reads clearly for ~25ms before the tail blooms in behind
    // it, instead of the two arriving at once and blurring together.
    const preDelay = ctx.createDelay(0.05);
    preDelay.delayTime.value = 0.025;
    const reverb = ctx.createConvolver();
    reverb.buffer = makeImpulseResponse(ctx);
    this.wet.connect(preDelay);
    preDelay.connect(reverb);
    reverb.connect(this.brightness);

    const buses: AudioBuses = { ctx, dry, wet: this.wet };

    this.voiceA = createChordVoice(buses, 0.061, this.detuneLfos);
    this.voiceB = createChordVoice(buses, 0.083, this.detuneLfos);
    this.voiceB.gain.gain.value = 0; // silent until a transition begins

    this.breath = createBreathLayer(buses);
    this.noise = createNoiseTexture(buses);
    this.wild = createWildLayer(buses);

    // Starts its own self-rescheduling loop immediately; it's a no-op
    // while the ambiance is muted, so this costs nothing until start().
    this.chime = createChimeLayer(buses);
    this.melody = createMelodyLayer(buses);
  }

  /** Resume the context (needed after a user gesture) and fade the pad in. */
  async start(volume: number) {
    if (this.disposed) return;
    if (this.ctx.state === "suspended") await this.ctx.resume();
    this.chime.setRunning(true);
    this.melody.setRunning(true);
    ramp(this.master.gain, volume, this.ctx, 2.5);
  }

  /** Fade the pad out; leaves the graph running (cheap) so start() is instant. */
  stop() {
    if (this.disposed) return;
    this.chime.setRunning(false);
    this.melody.setRunning(false);
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
    this.noise.setActivity(value);
    this.chime.setActivity(value);
  }

  /** Calmer texture while reading a long page (e.g. a blog post). */
  setFocusMode(active: boolean) {
    this.noise.setFocusMode(active);
    this.chime.setFocusMode(active);
    this.melody.setFocusMode(active);
  }

  setReducedMotion(reduced: boolean) {
    this.breath.setReducedMotion(reduced);
    this.wild.setReducedMotion(reduced);
    this.chime.setReducedMotion(reduced);
    this.melody.setReducedMotion(reduced);
    const detuneDepth = reduced ? 2 : 6;
    for (const lfo of this.detuneLfos)
      ramp(lfo.depth.gain, detuneDepth, this.ctx, 3);
  }

  /** The "wolf mode" Easter egg — a wild, low undertone. */
  setWildMode(active: boolean) {
    this.wild.setActive(active);
  }

  /**
   * Left uninterrupted for a while (no scroll, pointer, or key activity),
   * the piece opens up: more reverb, and the chime layer both loosens
   * its pace and lingers longer on each note. Any real interaction
   * should clear this immediately.
   */
  setResting(resting: boolean) {
    ramp(this.wet.gain, resting ? 0.55 : 0.35, this.ctx, 8);
    this.chime.setResting(resting);
  }

  /** One immediate, bright chime — feedback for a real interaction
   *  (a comment published, a link copied) rather than the ambient
   *  generative schedule. No-op while the ambiance itself is muted. */
  pulse() {
    this.chime.pulse();
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
      setChord(this.ctx, this.voiceA, prev);
      this.currentSabbatName = prev.name;
    }
    setChord(this.ctx, this.voiceB, next);
    // The wolf-mode undertone and the chime layer both key off the same
    // current root as the drone, so wolf mode never drifts out of tune
    // with whichever Sabbat is actually playing.
    const currentRootHz = noteHz(
      ROOT_HZ,
      semitoneOf(progress < 0.5 ? prev : next),
    );
    this.chime.setRootHz(currentRootHz);
    this.wild.setRootHz(currentRootHz);

    // The melody's two voices, unlike the chime's single blended root,
    // each need their own Sabbat's actual root — the whole point of the
    // cross-fade is prev fading out in its own key while next fades in
    // in its own, exactly like the chord voices below.
    this.melody.setSabbats(
      SABBAT_MELODIES[prev.name],
      noteHz(ROOT_HZ, semitoneOf(prev)),
      SABBAT_MELODIES[next.name],
      noteHz(ROOT_HZ, semitoneOf(next)),
      progress,
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
    // quietly governs how often and how brightly the chimes ring. On
    // Mōnandæg (Monday, the Moon's day — the header marks it too) that
    // reading gets a small, deliberate boost.
    const moonFraction = getMoonIllumination(now).fraction;
    const isMoonDay = now.getDay() === 1;
    this.chime.setMoonFraction(
      isMoonDay ? Math.min(1, moonFraction + 0.15) : moonFraction,
    );
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.chime.dispose();
    this.melody.dispose();
    try {
      this.ctx.close();
    } catch {
      // Already closed — nothing to do.
    }
  }
}
