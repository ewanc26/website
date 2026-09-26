/**
 * buffers.ts — generated audio buffers, so nothing under `music/` needs
 * to ship a sample file.
 */

/** A loopable buffer of white noise, source material for the texture layer. */
export function makeNoiseBuffer(ctx: AudioContext, seconds = 4): AudioBuffer {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

/**
 * A short synthetic impulse response — an exponentially decaying burst
 * of noise per channel — gives a soft algorithmic reverb tail.
 *
 * Each channel is normalised to unit energy after generation. A
 * ConvolverNode's gain is the sum of its impulse response's squared
 * samples — an un-normalised noise burst can (and, before this fix,
 * did) amplify whatever passes through it by an order of magnitude,
 * turning a "soft algorithmic reverb" into an unpredictable, harsh
 * wash. Normalising means the `wet` bus gain is the only thing that
 * controls how present the reverb is, exactly as it looks like it does.
 */
export function makeImpulseResponse(
  ctx: AudioContext,
  seconds = 2.8,
  decay = 3,
): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * seconds);
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);
    let energy = 0;
    for (let i = 0; i < length; i++) {
      const sample = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      data[i] = sample;
      energy += sample * sample;
    }
    const normalise = 1 / Math.sqrt(Math.max(energy, 1e-6));
    for (let i = 0; i < length; i++) data[i] *= normalise;
  }
  return impulse;
}
