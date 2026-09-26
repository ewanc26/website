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
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return impulse;
}
