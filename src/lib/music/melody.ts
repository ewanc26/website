/**
 * melody.ts — the foreground Sabbat melody: an actual composed tune
 * (see melodies.ts) playing over the generative pad and chime layers
 * underneath it, on a fixed step grid, cross-fading between the
 * current and next Sabbat's tune exactly the way the drone's chord
 * voices already cross-fade.
 *
 * Scheduling uses a lookahead clock — the fix described in Chris
 * Wilson's "A Tale of Two Clocks" for Web Audio timing drift: rather
 * than one `setTimeout` per note (fine for the chime layer's sparse,
 * randomised events, not for a tight rhythmic loop), a fast poll
 * schedules any notes due within a short lookahead window against
 * precise AudioContext time. The step index is a pure function of
 * that time, so muting and unmuting the ambiance never restarts or
 * re-phases the loop — it just continues exactly where it would have
 * been the whole time.
 */

import { noteHz } from "./notes";
import type { AudioBuses } from "./types";
import type { MelodyStep } from "./melodies";

const STEPS_PER_LOOP = 8;
export const MELODY_STEP_SECONDS = 1.6;
const LOOKAHEAD_SECONDS = 0.1;
const SCHEDULER_INTERVAL_MS = 25;
const NOTE_GATE_RATIO = 0.7; // fraction of a step the note actually sounds for

export interface MelodyLayer {
  setRunning(running: boolean): void;
  setFocusMode(active: boolean): void;
  setReducedMotion(reduced: boolean): void;
  /** Update both cross-fading voices at once — called from
   *  engine.update() alongside the drone's own chord voices. */
  setSabbats(
    prevSteps: MelodyStep[],
    prevRootHz: number,
    nextSteps: MelodyStep[],
    nextRootHz: number,
    progress: number,
  ): void;
  dispose(): void;
}

interface VoiceState {
  steps: MelodyStep[];
  rootHz: number;
  weight: number; // this voice's share of the cross-fade, 0..1
}

export function createMelodyLayer(buses: AudioBuses): MelodyLayer {
  const { ctx, dry, wet } = buses;

  let running = false;
  let disposed = false;
  let focusMode = false;
  let reducedMotion = false;

  const prev: VoiceState = { steps: [], rootHz: 55, weight: 1 };
  const next: VoiceState = { steps: [], rootHz: 55, weight: 0 };

  let nextStepTime: number | null = null;
  let stepIndex = 0;

  function playNote(voice: VoiceState, time: number) {
    if (voice.weight < 0.01) return;
    const degree = voice.steps[stepIndex % voice.steps.length];
    if (degree === null || degree === undefined) return;

    // Sit an octave above the drone's own root so the melody reads as
    // a distinct foreground line rather than doubling the pad.
    const freq = noteHz(voice.rootHz, degree + 12);
    const gateSeconds = MELODY_STEP_SECONDS * NOTE_GATE_RATIO;

    const vibrato = ctx.createOscillator();
    vibrato.frequency.value = 4.7;
    const vibratoDepth = ctx.createGain();
    vibratoDepth.gain.value = reducedMotion ? 2 : 5; // cents

    const osc1 = ctx.createOscillator();
    osc1.type = "triangle";
    osc1.frequency.value = freq;
    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.value = freq / 2; // an octave below, for warmth

    vibrato.connect(vibratoDepth);
    vibratoDepth.connect(osc1.detune);
    vibratoDepth.connect(osc2.detune);

    // A classic plucked-instrument filter envelope: bright at the
    // strike, darkening as the note rings out.
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.Q.value = 0.7;
    filter.frequency.setValueAtTime(Math.max(400, freq * 4), time);
    filter.frequency.exponentialRampToValueAtTime(
      Math.max(200, freq * 1.3),
      time + gateSeconds,
    );

    const subMix = ctx.createGain();
    subMix.gain.value = 0.35; // the sub-octave layer sits under the main tone

    const amp = ctx.createGain();
    const peak = (focusMode ? 0.07 : 0.1) * voice.weight;
    amp.gain.setValueAtTime(0, time);
    amp.gain.linearRampToValueAtTime(peak, time + 0.03);
    amp.gain.setValueAtTime(peak, time + gateSeconds * 0.6);
    amp.gain.exponentialRampToValueAtTime(0.0001, time + gateSeconds);

    // A lighter reverb send than the chime layer's — this is the piece's
    // clearest voice, so it should stay legible rather than wash out.
    const wetTap = ctx.createGain();
    wetTap.gain.value = 0.4;

    osc1.connect(filter);
    osc2.connect(subMix);
    subMix.connect(filter);
    filter.connect(amp);
    amp.connect(dry);
    amp.connect(wetTap);
    wetTap.connect(wet);

    const stopAt = time + gateSeconds + 0.05;
    osc1.start(time);
    osc2.start(time);
    vibrato.start(time);
    osc1.stop(stopAt);
    osc2.stop(stopAt);
    vibrato.stop(stopAt);
    osc1.onended = () => {
      osc1.disconnect();
      osc2.disconnect();
      vibrato.disconnect();
      vibratoDepth.disconnect();
      filter.disconnect();
      subMix.disconnect();
      amp.disconnect();
      wetTap.disconnect();
    };
  }

  function tick() {
    if (disposed) return;
    if (nextStepTime === null) {
      // Anchor to the next grid line in absolute AudioContext time, so
      // the loop's phase never depends on when start()/stop() happened.
      nextStepTime =
        Math.ceil(ctx.currentTime / MELODY_STEP_SECONDS) * MELODY_STEP_SECONDS;
      stepIndex =
        Math.round(nextStepTime / MELODY_STEP_SECONDS) % STEPS_PER_LOOP;
    }
    while (nextStepTime < ctx.currentTime + LOOKAHEAD_SECONDS) {
      if (running) {
        playNote(prev, nextStepTime);
        playNote(next, nextStepTime);
      }
      stepIndex = (stepIndex + 1) % STEPS_PER_LOOP;
      nextStepTime += MELODY_STEP_SECONDS;
    }
  }

  const timer = setInterval(tick, SCHEDULER_INTERVAL_MS);

  return {
    setRunning(value) {
      running = value;
    },
    setFocusMode(active) {
      focusMode = active;
    },
    setReducedMotion(reduced) {
      reducedMotion = reduced;
    },
    setSabbats(prevSteps, prevRootHz, nextSteps, nextRootHz, progress) {
      prev.steps = prevSteps;
      prev.rootHz = prevRootHz;
      prev.weight = 1 - progress;
      next.steps = nextSteps;
      next.rootHz = nextRootHz;
      next.weight = progress;
    },
    dispose() {
      disposed = true;
      clearInterval(timer);
    },
  };
}
