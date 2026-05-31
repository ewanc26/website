<script lang="ts">
  import SiteHead from '$lib/components/SiteHead.svelte';

  let { data } = $props();
</script>

<SiteHead title="Subscriptions" description="Publications I read on Standard.site." />

<main class="shell-narrow">
  <header class="page-hd">
    <h1 class="page-title">Subscriptions</h1>
    <p style="margin: var(--space-sm) 0 0; color: var(--color-ink-700);">
      A curated index of publications and feeds actively tracked on Standard.site.
    </p>
  </header>

  <section class="about-section">
    <h2 class="section-heading">Active Index</h2>
    
    {#if data.subscriptions.length === 0}
      <p style="color: var(--color-ink-500); font-family: var(--font-mono); font-size: var(--text-xs);">NULL_SET</p>
    {:else}
      <ul style="list-style: none; padding: 0; margin: 0;">
        {#each data.subscriptions as sub}
          <li>
            <a href={sub.url} target="_blank" rel="noopener" class="post-row">
              <div style="display: flex; flex-direction: column;">
                <span style="font-weight: 600;">{sub.name}</span>
                <span style="font-size: var(--text-xs); color: var(--color-ink-600);">{sub.authorDisplayName ?? sub.authorHandle}</span>
              </div>
              <span style="font-size: var(--text-xs); color: var(--color-ink-500);">{sub.authorHandle}</span>
            </a>
          </li>
        {/each}
      </ul>
    {/if}
  </section>
</main>
