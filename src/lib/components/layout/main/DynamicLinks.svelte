<script lang="ts">
  import { onMount } from "svelte";
  import { LinkCard } from "$lib/components/layout/main/card";
  import { fetchLinks, type LinkData } from "$lib/services/atproto";

  let links: LinkData | null = null;
  let loading = true;
  let error: string | null = null;

  onMount(async () => {
    try {
      links = await fetchLinks();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load links';
    } finally {
      loading = false;
    }
  });
</script>

<div class="mx-auto w-full max-w-2xl">
  {#if loading}
    <div class="animate-pulse rounded-xl bg-canvas-200 p-6 shadow-md dark:bg-canvas-800">
      <div class="mb-4 h-6 w-24 rounded bg-canvas-300 dark:bg-canvas-700"></div>
      <div class="space-y-3">
        {#each Array(4) as _}
          <div class="h-16 rounded-lg bg-canvas-300 dark:bg-canvas-700"></div>
        {/each}
      </div>
    </div>
  {:else if error}
    <div class="rounded-xl bg-red-50 p-6 text-center shadow-md dark:bg-red-900/20">
      <p class="text-red-600 dark:text-red-400">{error}</p>
    </div>
  {:else if links && links.cards.length > 0}
    <div
      class="rounded-xl bg-canvas-100 p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-canvas-900"
    >
      <h2 class="mb-4 text-2xl font-bold text-ink-900 dark:text-ink-50">Links</h2>
      <div class="grid gap-3 sm:grid-cols-2">
        {#each links.cards as link}
          <LinkCard 
            url={link.url} 
            title={link.text} 
            emoji={link.emoji} 
          />
        {/each}
      </div>
    </div>
  {:else if !loading}
    <div class="rounded-xl bg-canvas-100 p-12 text-center shadow-lg dark:bg-canvas-900">
      <p class="text-ink-700 dark:text-ink-300">
        No links available. Create a <code class="rounded bg-canvas-200 px-1 dark:bg-canvas-800">blue.linkat.board</code> record at 
        <a 
          href="https://linkat.blue/" 
          class="text-sage-600 hover:underline dark:text-sage-400"
        >
          https://linkat.blue/
        </a>
      </p>
    </div>
  {/if}
</div>