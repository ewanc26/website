<script lang="ts">
  import LinkCard from "../archive/LinkCard.svelte";

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

  // Access props using $props() in runes mode
  const { data }: { data: LinkBoard | undefined } = $props();

  // Function to handle the chance of Batarong
  function maybeBatarong() {
    const randomNumber = Math.floor(Math.random() * 1000000);
    if (randomNumber === 0) { // 1 in a million chance
      window.location.href = "https://www.youtube.com/watch?v=jJwVL5w_B3c"; // Batarong URL
    }
  }

  // Call the Batarong function when the data is empty or an error occurs
  $effect(() => {
    if (!data || !data.cards || data.cards.length === 0) {
      maybeBatarong();
    }
  });
</script>

{#if data && data.cards.length > 0}
  <div class="mb-12 ml-4">
    <div
      class="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr)_)] gap-x-4 gap-y-6 mx-2 my-6"
    >
      {#each data.cards as link}
        <LinkCard url={link.url} title={link.text} value={link.emoji} />
      {/each}
    </div>
  </div>
{:else}
  <!-- Placeholder for blue.linkat.board -->
  <div class="mb-12 ml-4 text-center text-sm italic opacity-75">
    create a <code>blue.linkat.board</code> record at <a href="https://linkat.blue/" class="text-link hover:text-link-hover">https://linkat.blue/</a>
  </div>
{/if}