<script lang="ts">
  /**
   * Compact "currently/last playing" chip from fm.teal.feed.play, styled
   * to sit pinned on the homepage's halftone moon alongside KibunStatus.
   */
  import type { Play } from "$lib/services/atproto/plays";
  import { usePoller } from "$lib/utils/polling.svelte";

  interface Props {
    play: Play | null;
  }
  let { play: initialPlay }: Props = $props();

  const POLL_MS = 30_000;
  const GRACE_S = 120;
  const DEFAULT_LEN_S = 240;

  function isLive(p: Play): boolean {
    return Date.now() - new Date(p.playedAt).getTime() < ((p.durationSec ?? DEFAULT_LEN_S) + GRACE_S) * 1000;
  }

  function ago(ms: number): string {
    const s = Math.max(0, Math.round(ms / 1000));
    if (s < 60) return "just now";
    const m = Math.round(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.round(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.round(h / 24)}d ago`;
  }

  async function fetchLatestPlay(): Promise<Play | null> {
    const res = await fetch("/api/plays?limit=1", { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(String(res.status));
    const { plays } = (await res.json()) as { plays: Play[] };
    return plays?.[0] ?? null;
  }

  const poller = usePoller(fetchLatestPlay, POLL_MS);
  const play = $derived(poller.data !== undefined ? poller.data : initialPlay);
  const live = $derived(play ? isLive(play) : false);

  let now = $state(Date.now());
  $effect(() => {
    const tick = setInterval(() => (now = Date.now()), 15_000);
    return () => clearInterval(tick);
  });
  const whenText = $derived(play ? (live ? "playing now" : ago(now - new Date(play.playedAt).getTime())) : "");
</script>

{#if play}
  <a
    class="moon-chip playing-chip"
    class:playing-chip--live={live}
    href={play.href}
    target={play.href ? "_blank" : undefined}
    rel={play.href ? "noopener" : undefined}
  >
    {#if play.artworkUrl}
      <img class="playing-chip-art" src={play.artworkUrl} alt="" width="32" height="32" loading="lazy" decoding="async" />
    {:else}
      <span class="playing-chip-seal" aria-hidden="true">♪</span>
    {/if}
    <span class="playing-chip-text">
      <strong>{play.track}</strong>
      <span class="playing-chip-meta">{play.artists.join(", ")} · {whenText}</span>
    </span>
  </a>
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

  .playing-chip {
    background: var(--paper);
    color: var(--ink);
    rotate: 2deg;
    text-decoration: none;
  }
  .playing-chip:hover {
    background: var(--riso-a);
    color: var(--on-ink);
  }
  .playing-chip--live {
    background: var(--riso-a);
    color: var(--on-ink);
  }

  .playing-chip-seal,
  .playing-chip-art {
    flex: none;
    width: 1.8em;
    height: 1.8em;
    border: 2px solid currentColor;
    object-fit: cover;
  }
  .playing-chip-seal {
    display: grid;
    place-items: center;
    font-size: 1.1em;
    line-height: 1;
  }

  .playing-chip-text {
    display: grid;
    min-width: 0;
    gap: 0.1em;
  }
  .playing-chip-text strong,
  .playing-chip-meta {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .playing-chip-meta {
    font-weight: 500;
    opacity: 0.85;
    font-size: 0.9em;
  }
  .playing-chip--live .playing-chip-meta::before {
    content: "● ";
  }
</style>
