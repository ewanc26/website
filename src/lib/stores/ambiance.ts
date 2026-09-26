/**
 * ambianceEnabled — persisted on/off switch for the background soundscape.
 *
 * Ambient audio is opt-in: browsers block autoplay without a user gesture
 * anyway, and an unexpected drone on page load would be an unwelcome
 * surprise. The choice is remembered in localStorage (mirroring the
 * shape of `wolfMode`'s store) so a returning visitor who turned it on
 * doesn't have to find the toggle again — playback still only resumes
 * once they interact with the page, per browser autoplay rules.
 */

import { browser } from "$app/environment";
import { writable } from "svelte/store";

const STORAGE_KEY = "ambiance-enabled";

function readStoredPreference(): boolean {
  if (!browser) return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function writeStoredPreference(value: boolean) {
  if (!browser) return;
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // Storage may be unavailable (private browsing, quota); not fatal.
  }
}

const ambianceStore = writable(readStoredPreference());

export const ambianceEnabled = {
  subscribe: ambianceStore.subscribe,
  toggle() {
    ambianceStore.update((value) => {
      const newValue = !value;
      writeStoredPreference(newValue);
      return newValue;
    });
  },
  enable() {
    writeStoredPreference(true);
    ambianceStore.set(true);
  },
  disable() {
    writeStoredPreference(false);
    ambianceStore.set(false);
  },
};
