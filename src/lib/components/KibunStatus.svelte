<script lang="ts">
  /**
   * Mood/status readout, styled as a stamped chip meant to sit pinned on
   * the homepage's halftone moon. The Astro site fetched this once per
   * homepage render with no live update; this polls /api/kibun so it can
   * change while the tab stays open, using the same pattern as NowPlaying.
   */
  import type { KibunStatusData } from "$lib/services/atproto/types";
  import { usePoller } from "$lib/utils/polling.svelte";

  interface Props {
    status: KibunStatusData | null;
  }
  let { status: initialStatus }: Props = $props();

  const POLL_MS = 60_000;

  async function fetchKibun(): Promise<KibunStatusData | null> {
    const res = await fetch("/api/kibun", { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(String(res.status));
    const { status } = (await res.json()) as { status: KibunStatusData | null };
    return status;
  }

  const poller = usePoller(fetchKibun, POLL_MS);
  const status = $derived(poller.data !== undefined ? poller.data : initialStatus);
</script>

{#if status}
  <div class="moon-chip mood-chip" role="status">
    <span class="mood-chip-seal" aria-hidden="true">{status.emoji}</span>
    <span class="mood-chip-text">{status.text}</span>
  </div>
{/if}

<style>
  .moon-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.5em;
    max-width: 16rem;
    padding: 0.4em 0.75em;
    border: var(--edge) solid var(--ink);
    font-family: var(--font-pixel);
    font-weight: 600;
    font-size: var(--text-xs);
    line-height: 1.3;
    text-align: start;
  }

  .mood-chip {
    background: var(--riso-b);
    color: var(--on-ink);
    rotate: -3deg;
  }

  .mood-chip-seal {
    flex: none;
    display: grid;
    place-items: center;
    width: 1.8em;
    height: 1.8em;
    border: 2px solid var(--on-ink);
    border-radius: 50%;
    font-size: 1.1em;
    line-height: 1;
    background: var(--paper);
  }

  .mood-chip-text {
    text-wrap: pretty;
  }
</style>
