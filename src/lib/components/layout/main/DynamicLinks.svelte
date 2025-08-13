<script lang="ts">
  import { fade } from "svelte/transition";
  import { ArchiveCard } from "$components/archive";
  import type { LinkBoard } from "$components/shared";

  // Export the data prop that will receive the fetched links
  export let data: LinkBoard | undefined;
  
  // Add loading state tracking
  let isVisible = false;
  
  // Show content with a small delay for better perceived performance
  $: if (data) {
    setTimeout(() => {
      isVisible = true;
    }, 100);
  } else {
    isVisible = true; // Show placeholder immediately
  }
</script>

{#if isVisible}
  <div transition:fade={{ duration: 300 }}>
    {#if data && data.cards.length > 0}
      <div class="mb-12">
        <div
          class="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr)_)] gap-x-6 gap-y-6 my-6"
        >
          {#each data.cards as link}
            <ArchiveCard type="link" url={link.url} title={link.text} value={link.emoji} />
          {/each}
        </div>
      </div>
    {:else if data !== undefined}
      <!-- Show placeholder only if data loading completed but empty -->
      <div class="mb-12 ml-4 text-center text-sm italic opacity-75">
        create a <code>blue.linkat.board</code> record at <a href="https://linkat.blue/" class="text-link hover:text-link-hover">https://linkat.blue/</a>
      </div>
    {/if}
  </div>
{/if}