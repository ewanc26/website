<script lang="ts">
  /**
   * Mood/status readout. The Astro site fetched this once per homepage
   * render with no live update; this polls /api/kibun so it can change
   * while the tab stays open, using the same pattern as NowPlaying.
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
  <span class="now"><span aria-hidden="true">{status.emoji}</span>{status.text}</span>
{/if}
