/**
 * types.ts — shared shapes passed between the `music/` atoms.
 */

/** The dry/wet buses every layer mixes into. */
export interface AudioBuses {
  ctx: AudioContext;
  dry: GainNode;
  wet: GainNode;
}

export interface DetuneLfo {
  osc: OscillatorNode;
  depth: GainNode;
}

/** One drone chord voice: three close-voiced oscillators plus a sub. */
export interface ChordVoice {
  gain: GainNode;
  filter: BiquadFilterNode;
  pan: StereoPannerNode;
  oscillators: OscillatorNode[];
  sub: OscillatorNode;
}
