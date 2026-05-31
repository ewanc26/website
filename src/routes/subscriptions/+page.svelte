<script lang="ts">
  import SiteHead from '$lib/components/SiteHead.svelte';

  let { data } = $props();
</script>

<SiteHead title="Subscriptions" description="Publications I read on Standard.site." />

<main class="shell-narrow">
  <header class="page-hd">
    <h1 class="page-title">Subscriptions</h1>
    <p class="page-desc">
      A curated index of publications and feeds actively tracked on Standard.site.
    </p>
  </header>

  <section class="sub-section">
    <h2 class="section-heading">Active Index</h2>
    
    {#if data.subscriptions.length === 0}
      <p class="empty-mono">NULL_SET</p>
    {:else}
      <ul class="bare-list">
        {#each data.subscriptions as sub}
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

  <section class="sub-section">
      <h2 class="section-heading">Recommendations</h2>

      {#if data.recommendations.length === 0}
          <p class="empty-mono">NULL_SET</p>
      {:else}
          <ul class="bare-list">
              {#each data.recommendations as rec}
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

<style>
  .sub-section {
    margin-bottom: var(--space-xl);
  }

  .empty-mono {
    color: var(--color-ink-500);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
  }

  .sub-name {
    font-weight: 600;
  }

  .sub-author {
    font-size: var(--text-xs);
    color: var(--color-ink-600);
  }

  .sub-handle {
    font-size: var(--text-xs);
    color: var(--color-ink-500);
  }
</style>
