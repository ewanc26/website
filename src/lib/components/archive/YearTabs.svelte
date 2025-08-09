<script lang="ts">
  export let groupedByYear: any[];
  export let activeYear: number;

  function setActiveYear(year: number) {
    activeYear = year;
  }

  // Calculate the active tab index more reliably
  $: activeTabIndex = groupedByYear.findIndex((g) => g.year === activeYear);
  $: indicatorLeft = activeTabIndex >= 0 ? activeTabIndex * 100 : 0;
</script>

<div
  class="flex mb-3 sm:mb-4 lg:mb-6 pl-4 overflow-x-auto relative tabs-container"
>
  {#each groupedByYear as { year }, i}
    <button
      class="w-[100px] min-w-[100px] px-4 py-2 font-medium transition-all duration-300 relative z-10 flex items-center justify-center"
      onclick={() => setActiveYear(year)}
    >
      <span
        class="px-3 py-1 rounded-full transition-all duration-300 {activeYear === year
          ? 'bg-primary text-[var(--background-color)] transform scale-105'
          : 'text-text opacity-80 hover:text-primary hover:bg-primary/10'}"
      >
        {year}
      </span>
    </button>
  {/each}
</div>

<style>
  /* Custom scrollbar styling for tabs container */
  .tabs-container::-webkit-scrollbar {
    height: 6px;
  }

  .tabs-container::-webkit-scrollbar-track {
    background: var(--header-footer-bg);
    border-radius: 3px;
  }

  .tabs-container::-webkit-scrollbar-thumb {
    background: var(--button-bg);
    border-radius: 3px;
  }

  .tabs-container::-webkit-scrollbar-thumb:hover {
    background: var(--button-hover-bg);
  }
</style>