<script lang="ts">
  import ArchiveCard from "../archive/ArchiveCard.svelte";

  // Define the type for a single link card
  interface Card {
    url: string;
    text: string;
    emoji: string;
  }

  // Define the type for the fetched data structure
  interface LinkBoard {
    $type: "blue.linkat.board";
    cards: Card[];
  }

  // Export the data prop that will receive the fetched links
  export let data: LinkBoard | undefined;

  // Define the type for a single link card
  interface Card {
    url: string;
    text: string;
    emoji: string;
  }

  // Define the type for the fetched data structure
  interface LinkBoard {
    $type: "blue.linkat.board";
    cards: Card[];
  }
</script>

{#if data && data.cards.length > 0}
  <div class="mb-12 ml-4">
    <div
      class="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr)_)] gap-x-6 gap-y-6 mx-2 my-6"
    >
      {#each data.cards as link}
        <ArchiveCard type="link" url={link.url} title={link.text} value={link.emoji} />
      {/each}
    </div>
  </div>
{:else}
  <!-- Placeholder for blue.linkat.board -->
  <div class="mb-12 ml-4 text-center text-sm italic opacity-75">
    create a <code>blue.linkat.board</code> record at <a href="https://linkat.blue/" class="text-link hover:text-link-hover">https://linkat.blue/</a>
  </div>
{/if}