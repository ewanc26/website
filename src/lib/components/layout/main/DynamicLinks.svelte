<script lang="ts">
  import { fade } from "svelte/transition";
  import { onMount } from "svelte";
  import { ArchiveCard } from "$components/archive";
  import { getCache, setCache } from "$utils/cache";
  import type { LinkBoard } from "$components/shared";

  // Export the data prop that will receive the fetched links
  export let data: LinkBoard | undefined;
  
  // Add loading state tracking
  let isVisible = false;
  let cachedData: LinkBoard | undefined;
  let hasCachedData = false;
  
  // Cache key for dynamic links
  const CACHE_KEY = 'dynamic_links_data';
  const CACHE_TTL = 3600000; // 1 hour in milliseconds
  
  onMount(() => {
    // Try to load from cache first
    const cached = getCache<LinkBoard>(CACHE_KEY);
    if (cached && cached.cards && cached.cards.length > 0) {
      cachedData = cached;
      hasCachedData = true;
      isVisible = true; // Show cached data immediately
    } else {
      // No valid cached data, show component (might show placeholder)
      isVisible = true;
    }
  });
  
  // Watch for data changes and update cache
  $: if (data && data.cards && data.cards.length > 0) {
    // Cache the new data
    setCache(CACHE_KEY, data, CACHE_TTL);
    cachedData = data;
    hasCachedData = true;
    
    if (!isVisible) {
      // Show content with a small delay for better perceived performance only if not already visible
      setTimeout(() => {
        isVisible = true;
      }, 100);
    }
  } else if (!hasCachedData && !isVisible) {
    // Only show placeholder if we don't have cached data and aren't visible yet
    isVisible = true;
  }
  
  // Use cached data if available, otherwise use prop data
  $: displayData = hasCachedData ? cachedData : data;
</script>

{#if isVisible}
  <div transition:fade={{ duration: 300 }}>
    {#if displayData && displayData.cards.length > 0}
      <section class="dynamic-links">
        <div class="section-header" transition:fade={{ delay: 100, duration: 300 }}>
          <h2 class="section-title">Links</h2>
        </div>
        
        <div class="links-container" transition:fade={{ delay: 300, duration: 400 }}>
          <div
            class="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr)_)] gap-x-6 gap-y-6 my-6"
          >
            {#each displayData.cards as link}
              <ArchiveCard type="link" url={link.url} title={link.text} value={link.emoji} />
            {/each}
          </div>
        </div>
      </section>
    {:else if displayData !== undefined}
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