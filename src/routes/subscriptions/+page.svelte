<script lang="ts">
  import { onMount } from 'svelte';
  import SiteHead from '$lib/components/SiteHead.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import LoadingSkeleton from '$lib/components/LoadingSkeleton.svelte';
  import type { SubscriptionPublication, RecommendationItem } from '$lib/services/atproto/fetch';

  let subscriptions = $state<SubscriptionPublication[] | null>(null);
  let recommendations = $state<RecommendationItem[] | null>(null);

  onMount(async () => {
    try {
      const [subsRes, recsRes] = await Promise.all([
        fetch('/api/subscriptions'),
        fetch('/api/recommendations')
      ]);
      if (!subsRes.ok || !recsRes.ok) {
        throw new Error(`Subscription APIs returned ${subsRes.status}/${recsRes.status}`);
      }
      subscriptions = await subsRes.json();
      recommendations = await recsRes.json();
    } catch (e) {
      console.error("Failed to load subscriptions/recommendations", e);
      subscriptions = [];
      recommendations = [];
    }
  });
</script>

<SiteHead title="Subscriptions" description="Publications I read on Standard.site." ogSubtitle="Publications and feeds I follow." ogType="SUBSCRIPTIONS" />

<main class="shell-narrow">
  <header class="page-hd">
    <h1 class="page-title">Subscriptions</h1>
    <p class="page-desc">
      A curated index of publications and feeds actively tracked on Standard.site.
    </p>
  </header>

  <section class="sub-section" aria-busy={subscriptions === null}>
    <h2 class="section-heading">Active Index</h2>
    
    {#if subscriptions === null}
      <LoadingSkeleton count={3} label="Loading subscriptions" />
    {:else if subscriptions.length === 0}
      <EmptyState
        title="No subscriptions"
        description="Unable to load subscriptions at the moment. The service may be temporarily unavailable."
        icon={false}
      />
    {:else}
      <ul class="bare-list content-reveal-list">
        {#each subscriptions as sub}
          <li>
            <a href={sub.url} target="_blank" rel="noopener" class="post-row">
              <div class="row-stack">
                <span class="sub-name">{sub.name}</span>
                <span class="sub-author">{sub.authorDisplayName ?? sub.authorHandle}</span>
              </div>
              <span class="sub-handle">{sub.authorHandle}</span>
            </a>
          </li>
        {/each}
      </ul>
    {/if}
  </section>

  <section class="sub-section" aria-busy={recommendations === null}>
      <h2 class="section-heading">Recommendations</h2>

      {#if recommendations === null}
          <LoadingSkeleton count={3} label="Loading recommendations" />
      {:else if recommendations.length === 0}
          <EmptyState
            title="No recommendations"
            description="Unable to load recommendations at the moment. The service may be temporarily unavailable."
            icon={false}
          />
      {:else}
          <ul class="bare-list content-reveal-list">
              {#each recommendations as rec}
                  <li>
                      <a href={rec.url} target="_blank" rel="noopener" class="post-row">
                          <div class="row-stack">
                              <span class="sub-name">{rec.name}</span>
                              {#if rec.description}
                                  <span class="sub-author">{rec.description}</span>
                              {/if}
                          </div>
                          <span class="sub-handle">{rec.authorHandle}</span>
                      </a>
                  </li>
              {/each}
          </ul>
      {/if}
  </section>
</main>
