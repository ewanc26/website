<script lang="ts">
  /**
   * Subscribed/recommended publication list. The Astro site fetched this
   * once per /subscriptions render with no live update; this polls
   * /api/subscriptions and /api/recommendations so new subscriptions show
   * up without a full page reload, using the same pattern as NowPlaying.
   */
  import type { SubscriptionPublication } from "$lib/services/atproto/fetch";
  import { usePoller } from "$lib/utils/polling.svelte";

  interface Props {
    subscriptions: SubscriptionPublication[];
    recommendations: SubscriptionPublication[];
  }
  let { subscriptions: initialSubscriptions, recommendations: initialRecommendations }: Props = $props();

  const POLL_MS = 300_000;

  async function fetchList(path: string): Promise<SubscriptionPublication[]> {
    const res = await fetch(path, { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as SubscriptionPublication[];
    return Array.isArray(data) ? data : [];
  }

  const subscriptionsPoller = usePoller(() => fetchList("/api/subscriptions"), POLL_MS);
  const recommendationsPoller = usePoller(() => fetchList("/api/recommendations"), POLL_MS);

  const subscriptions = $derived(subscriptionsPoller.data ?? initialSubscriptions);
  const recommendations = $derived(recommendationsPoller.data ?? initialRecommendations);
</script>

<div class="cols thunk" style="--i:1">
  <h2>Subscribed</h2>
  {#if subscriptions.length === 0}
    <p class="empty">No subscriptions could be loaded just now.</p>
  {:else}
    <ul class="shelf">
      {#each subscriptions as sub (sub.uri)}
        <li>
          <a href={sub.url} rel="noopener">
            <span class="shelf-name">{sub.name}</span>
            <span class="shelf-meta">{sub.authorHandle}</span>
            <p class="shelf-note">{sub.authorDisplayName ?? sub.authorHandle}</p>
          </a>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<div class="cols thunk" style="--i:2">
  <h2>Recommended</h2>
  {#if recommendations.length === 0}
    <p class="empty">No recommendations could be loaded just now.</p>
  {:else}
    <ul class="shelf">
      {#each recommendations as rec (rec.uri)}
        <li>
          <a href={rec.url} rel="noopener">
            <span class="shelf-name">{rec.name}</span>
            <span class="shelf-meta">{rec.authorHandle}</span>
            {#if rec.description}<p class="shelf-note">{rec.description}</p>{/if}
          </a>
        </li>
      {/each}
    </ul>
  {/if}
</div>
