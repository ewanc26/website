<script lang="ts">
  import SiteHead from '$lib/components/SiteHead.svelte';

  let { data } = $props();
</script>

<SiteHead title="About" description={data.profile?.description} />

<main class="shell-narrow">
  <header class="page-hd">
    <h1 class="page-title">About</h1>
  </header>
  {#if data.profile}
    <section class="about-content">
      <h2 style="font-size: var(--text-lg); margin-bottom: var(--space-xs);">{data.profile.displayName}</h2>
      <p style="font-size: var(--text-sm); color: var(--color-ink-600); margin-bottom: var(--space-md);">{data.profile.pronouns}</p>
      <p style="line-height: 1.75;">{data.profile.description}</p>
    </section>
  {/if}
</main>

<style>
  .page-hd {
    padding: var(--space-lg) 0;
  }

  .page-title {
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 800;
    letter-spacing: -0.03em;
    margin: 0;
  }

  .about-content {
    padding: var(--space-lg) 0;
  }
</style>
