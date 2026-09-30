<script lang="ts">
  /**
   * Live scrobble read-out from fm.teal.feed.play. Server-rendered first
   * (via the `plays` prop), then refreshed from /api/plays while the tab
   * is visible, using the shared polling primitive.
   */
  import type { Play } from "$lib/services/atproto/plays";
  import { usePoller } from "$lib/utils/polling.svelte";

  interface Props {
    plays: Play[];
    limit?: number;
  }
  let { plays: initialPlays, limit = 5 }: Props = $props();

  const POLL_MS = 30_000;
  const GRACE_S = 120;
  const DEFAULT_LEN_S = 240;

  function ago(ms: number): string {
    const s = Math.max(0, Math.round(ms / 1000));
    if (s < 60) return "just now";
    const m = Math.round(s / 60);
    if (m < 60) return `${m} min ago`;
    const h = Math.round(m / 60);
    if (h < 24) return `${h} h ago`;
    return `${Math.round(h / 24)} d ago`;
  }

  function isLive(p: Play): boolean {
    return Date.now() - new Date(p.playedAt).getTime() < ((p.durationSec ?? DEFAULT_LEN_S) + GRACE_S) * 1000;
  }

  async function fetchPlays(): Promise<Play[]> {
    const res = await fetch(`/api/plays?limit=${limit}`, { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(String(res.status));
    const { plays: next } = (await res.json()) as { plays: Play[] };
    if (!Array.isArray(next)) throw new Error("malformed /api/plays response");
    return next.slice(0, limit);
  }

  const poller = usePoller(fetchPlays, POLL_MS);
  const plays = $derived(poller.data ?? initialPlays);
  const latest = $derived(plays[0]);
  const live = $derived(latest ? isLive(latest) : false);

  // Repaints relative "time ago" labels without a network refetch.
  let now = $state(Date.now());
  $effect(() => {
    const tick = setInterval(() => (now = Date.now()), 15_000);
    return () => clearInterval(tick);
  });

  const status = $derived.by(() => {
    void now; // recompute on each repaint tick
    if (!latest) return "";
    return live ? "● Playing now" : `Last played ${ago(Date.now() - new Date(latest.playedAt).getTime())}`;
  });
</script>

<div class="np" class:np--live={live}>
  <p class="np-status pix" role="status">{status}</p>
  <ol class="tracks np-list">
    {#if plays.length === 0}
      <li class="empty">Silence, at the moment.</li>
    {/if}
    {#each plays as p, i (p.playedAt)}
      {@const when = ago(now - new Date(p.playedAt).getTime())}
      <li class="track np-item" class:np-item--live={i === 0 && live}>
        {#if p.artworkUrl}
          <img src={p.artworkUrl} alt="" width="40" height="40" loading="lazy" decoding="async" />
        {:else}
          <span class="np-art" aria-hidden="true">♪</span>
        {/if}
        <span class="np-text">
          <strong>
            {#if p.href && /^https?:\/\//i.test(p.href)}
              <a href={p.href} rel="noopener">{p.track}</a>
            {:else}
              {p.track}
            {/if}
          </strong>
          <span>{p.artists.join(", ")}{p.release ? ` · ${p.release}` : ""}</span>
        </span>
        <time class="pix np-when" datetime={p.playedAt}>{when}</time>
      </li>
    {/each}
  </ol>
</div>

<style>
  .np-status {
    margin: 0 0 0.5rem;
    min-height: 1.4em;
  }
  .np--live .np-status {
    color: var(--riso-a-text);
  }
  .np--live .np-status::first-letter {
    animation: np-blink 1.6s steps(2, jump-none) infinite;
  }
  @keyframes np-blink {
    50% {
      opacity: 0.25;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .np--live .np-status::first-letter {
      animation: none;
    }
  }
  .np-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .np-item {
    display: grid;
    grid-template-columns: 40px 1fr auto;
    align-items: center;
    gap: 0.75rem;
    padding: 0.4rem 0;
  }
  .np-item img,
  .np-art {
    width: 40px;
    height: 40px;
    object-fit: cover;
    display: grid;
    place-items: center;
    border: 2px solid var(--ink, currentColor);
    image-rendering: auto;
  }
  .np-text {
    display: grid;
    min-width: 0;
  }
  .np-text > * {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .np-item--live .np-text strong {
    color: var(--riso-a-text);
  }
  .np-when {
    white-space: nowrap;
  }
</style>
