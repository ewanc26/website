/**
 * ramp.ts — tiny AudioParam and randomisation helpers shared across the
 * chord-voice, texture, and chime layers.
 */

import { SMOOTH_S } from "./constants";

/** Move an AudioParam toward `value` smoothly, so nothing pops or clicks. */
export function ramp(
  param: AudioParam,
  value: number,
  ctx: AudioContext,
  timeConstant = SMOOTH_S,
) {
  param.setTargetAtTime(value, ctx.currentTime, timeConstant);
}

export function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}
