/**
 * Shared state for Easter eggs.
 * Currently manages the "three clicks" triskele toast.
 */

import { writable } from "svelte/store";

// ── Easter egg #3: three clicks on the triskele ──────────────────
let _threeTimer: ReturnType<typeof setTimeout> | null = null;

export const threeVisible = writable(false);

/**
 * Show the "Three again." toast for 3 seconds.
 * Calling while visible resets the timer.
 */
export function triggerThree() {
  if (_threeTimer) clearTimeout(_threeTimer);
  threeVisible.set(true);
  _threeTimer = setTimeout(() => {
    threeVisible.set(false);
    _threeTimer = null;
  }, 3000);
}
