<script lang="ts">
  import SiteHead from '$lib/components/SiteHead.svelte';

  let { data } = $props();
</script>

<SiteHead title="About" description={data.profile?.description} />

<main>
    <header>
        <h1 style="font-size: var(--text-xl);">About</h1>
    </header>
    {#if data.profile}
        <section style="margin-top: var(--space-md);">
            <h2 style="font-size: var(--text-lg);">{data.profile.displayName}</h2>
            <p style="font-size: var(--text-sm); opacity: 0.8;">{data.profile.pronouns}</p>
            <p style="margin-top: var(--space-md); font-size: var(--text-md); line-height: 1.6;">
                {data.profile.description}
            </p>
        </section>
    {/if}
</main>
