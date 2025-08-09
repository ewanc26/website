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
  class="flex mb-6 pl-4 border-b border-button overflow-x-auto relative tabs-container"
>
  <div class="tab-indicator-container absolute bottom-0 left-0 h-0.5 w-full">
    <div
      class="tab-indicator bg-primary h-full absolute bottom-0 transition-all duration-300 ease-out"
      style="left: {indicatorLeft}px; width: 100px;"
    ></div>
  </div>

  {#each groupedByYear as { year }, i}
    <button
      class="w-[100px] min-w-[100px] px-4 py-2 font-medium transition-all duration-300 relative z-10 text-center
            {activeYear === year
        ? 'text-primary'
        : 'text-text opacity-80 hover:text-primary-hover'}"
      onclick={() => setActiveYear(year)}
    >
      <span
        class="{activeYear === year
          ? 'transform transition-transform duration-300 scale-105'
          : ''}"
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