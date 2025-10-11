<script lang="ts">
  import { fade } from "svelte/transition";
  import { ArchiveCard } from "$components/archive";
  import type { LinkBoard } from "$components/shared";

  // Can receive either a Promise or direct data
  export let data: LinkBoard | null | undefined;
</script>

{#if data && data.cards && data.cards.length > 0}
  <section class="dynamic-links" transition:fade={{ duration: 300 }}>
    <div class="section-header" transition:fade={{ delay: 100, duration: 300 }}>
      <h2 class="section-title">Links</h2>
    </div>
    
    <div class="links-container" transition:fade={{ delay: 300, duration: 400 }}>
      <div class="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr)_)] gap-x-6 gap-y-6 my-6">
        {#each data.cards as link}
          <ArchiveCard type="link" url={link.url} title={link.text} value={link.emoji} />
        {/each}
      </div>
    </div>
  </section>
{:else if data === undefined}
  <div class="mb-12 ml-4 text-center text-sm italic opacity-50">
    Loading links...
  </div>
{:else}
  <div class="mb-12 ml-4 text-center text-sm italic opacity-75">
    create a <code>blue.linkat.board</code> record at <a href="https://linkat.blue/" class="text-link hover:text-link-hover">https://linkat.blue/</a>
  </div>
{/if}

<style>
  .dynamic-links {
    margin-bottom: 3rem;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: flex-end;
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
    right: 0;
    width: 3rem;
    height: 3px;
    background: var(--link-color);
    border-radius: 2px;
  }

  .links-container {
    display: block;
  }

  @media (max-width: 640px) {
    .section-header {
      flex-direction: column;
      align-items: flex-end;
      gap: 1rem;
    }

    .section-title {
      font-size: 1.5rem;
    }
  }
</style>
