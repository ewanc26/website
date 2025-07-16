<script lang="ts">
  export let groupedByYear: any[];
  export let activeYear: number;

  function setActiveYear(year: number) {
    activeYear = year;
  }
</script>

<div
  class="flex mb-6 border-b border-[var(--button-bg)] overflow-x-auto relative tabs-container"
>
  <div class="tab-indicator-container absolute bottom-0 left-0 h-0.5 w-full">
    <div
      class="tab-indicator bg-[var(--link-color)] h-full absolute bottom-0 transition-all duration-300 ease-out"
      style="left: {groupedByYear.findIndex((g) => g.year === activeYear) *
        100}px; width: 100px;"
    ></div>
  </div>

  {#each groupedByYear as { year }, i}
    <button
      class="w-[100px] min-w-[100px] px-4 py-2 font-medium transition-all duration-300 relative z-10 text-center
            {activeYear === year
        ? 'text-[var(--link-color)]'
        : 'text-[var(--text-color)] opacity-80 hover:text-[var(--link-hover-color)]'}"
      onclick={() => setActiveYear(year)}
    >
      <span
        class="relative {activeYear === year
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
