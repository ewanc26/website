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
      <section class="dynamic-links">
        <div class="section-header" transition:fade={{ delay: 100, duration: 300 }}>
          <h2 class="section-title">Links</h2>
        </div>
        
        <div class="links-container" transition:fade={{ delay: 300, duration: 400 }}>
          <div
            class="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr)_)] gap-x-6 gap-y-6 my-6"
          >
            {#each data.cards as link}
              <ArchiveCard type="link" url={link.url} title={link.text} value={link.emoji} />
            {/each}
          </div>
        </div>
      </section>
    {:else if data !== undefined}
      <!-- Show placeholder only if data loading completed but empty -->
      <div class="mb-12 ml-4 text-center text-sm italic opacity-75">
        create a <code>blue.linkat.board</code> record at <a href="https://linkat.blue/" class="text-link hover:text-link-hover">https://linkat.blue/</a>
      </div>
    {/if}
  </div>
{/if}

<style>
  .dynamic-links {
    margin-bottom: 3rem;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: flex-end; /* Right-aligned instead of space-between */
    margin-bottom: 1.5rem;
    padding: 0;
  }

  .section-title {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-color);
    position: relative;
  }

  .section-title::after {
    content: '';
    position: absolute;
    bottom: -4px;
    right: 0; /* Align underline to the right */
    width: 3rem;
    height: 3px;
    background: var(--link-color);
    border-radius: 2px;
  }

  .links-container {
    display: block;
  }

  /* Responsive adjustments */
  @media (max-width: 640px) {
    .section-header {
      flex-direction: column;
      align-items: flex-end; /* Keep right alignment on mobile */
      gap: 1rem;
    }

    .section-title {
      font-size: 1.5rem;
    }
  }
</style>