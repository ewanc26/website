/**
 * Shared "fetch on an interval, pause while the tab is hidden, refresh the
 * moment it becomes visible again" pattern. Every live-refreshing widget in
 * the old Astro build (NowPlaying, SeasonalThemeUpdater, and the backlink/
 * kibun/subscriptions widgets added during this migration) hand-rolled this
 * same setInterval + visibilitychange bookkeeping; this factors it into one
 * reactive primitive so each widget only supplies its fetch function.
 */
import { onMount } from "svelte";

export interface Poller<T> {
  readonly data: T | undefined;
  readonly error: unknown;
  readonly loading: boolean;
  /** Force an immediate refresh, bypassing the interval. */
  refresh: () => Promise<void>;
}

/**
 * Creates a poller and wires its start/stop lifecycle to the calling
 * component via onMount. Must be called during component initialisation
 * (same rule as other Svelte lifecycle functions).
 */
export function usePoller<T>(fetcher: () => Promise<T>, intervalMs: number): Poller<T> {
  let data = $state<T | undefined>(undefined);
  let error = $state<unknown>(undefined);
  let loading = $state(false);

  async function tick() {
    loading = true;
    try {
      data = await fetcher();
      error = undefined;
    } catch (err) {
      error = err;
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    void tick();
    const interval = setInterval(() => {
      if (!document.hidden) void tick();
    }, intervalMs);
    const onVisibilityChange = () => {
      if (!document.hidden) void tick();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  });

  return {
    get data() {
      return data;
    },
    get error() {
      return error;
    },
    get loading() {
      return loading;
    },
    refresh: tick,
  };
}
