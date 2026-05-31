<script lang="ts">
  import SiteHead from '$lib/components/SiteHead.svelte';

  let { data } = $props();
  const { profile } = data;
</script>

<SiteHead title="About" description={profile?.description} />

<main>
    <header>
        <h1 style="font-size: var(--text-xl);">About</h1>
    </header>
    {#if profile}
        <section style="margin-top: var(--space-md);">
            <h2 style="font-size: var(--text-lg);">{profile.displayName}</h2>
            <p style="font-size: var(--text-sm); opacity: 0.8;">{profile.pronouns}</p>
            <p style="margin-top: var(--space-md); font-size: var(--text-md); line-height: 1.6;">
                {profile.description}
            </p>
        </section>
    {/if}
</main>
