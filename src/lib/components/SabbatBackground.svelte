<script lang="ts">
  import { onMount } from 'svelte';

  const sabbats = [
    { name: 'Imbolc', month: 2, day: 1, paths: ['M9 21h6', 'M12 21v-9a3 3 0 0 1 3-3', 'M12 21v-9a3 3 0 0 0-3-3', 'M12 7V3'] },
    { name: 'Ostara', month: 3, day: 21, paths: ['M12 22C17.5 22 21 17 21 11C21 5 17.5 2 12 2C6.5 2 3 5 3 11C3 17 6.5 22 12 22Z', 'M10 8c0-3-1-6 1-6s2 3 2 6', 'M12 8c0-3-1-6 1-6s2 3 2 6', 'M16 22l1-2', 'M8 22l-1-2'] },
    { name: 'Beltane', month: 5, day: 1, paths: ['M12 2v20', 'M12 5l7 3', 'M12 5l-7 3', 'M12 10l7 3', 'M12 10l-7 3', 'M12 15l7 3', 'M12 15l-7 3'] },
    { name: 'Litha', month: 6, day: 21, paths: ['M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0', 'M12 2v2', 'M12 20v2', 'M2 12h2', 'M20 12h2', 'm19.07 4.93-1.41 1.41', 'm19.07 19.07-1.41-1.41', 'm4.93 19.07 1.41-1.41', 'm4.93 4.93 1.41-1.41'] },
    { name: 'Lughnasadh', month: 8, day: 1, paths: ['M7 20h10', 'M12 20V10', 'M12 10a4 4 0 0 1 4 4', 'M12 10a4 4 0 0 0-4 4'] },
    { name: 'Mabon', month: 9, day: 21, paths: ['M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.47 10-10 10Z', 'M17 21l-4.3-4.3'] },
    { name: 'Samhain', month: 10, day: 31, paths: ['M12 2C7.03 2 3 6.03 3 11c0 3.28 2.05 6.13 5 7.42V20c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-1.58c2.95-1.29 5-4.14 5-7.42 0-4.97-4.03-9-9-9Z', 'M9 14h.01', 'M15 14h.01'] },
    { name: 'Yule', month: 12, day: 21, paths: ['M12 2v20', 'M2 12h20', 'm20 4-16 16', 'm4 4 16 16'] }
  ];

  type ActiveState = {
    prev: typeof sabbats[0];
    next: typeof sabbats[0];
    progress: number; // 0 to 1
  };

  let state = $state<ActiveState | null>(null);

  function updateState() {
    const now = new Date();
    const year = now.getFullYear();
    const getSabbatDate = (s: typeof sabbats[0], y: number) => new Date(y, s.month - 1, s.day);

    const allSabbats = [
      ...sabbats.map(s => ({ ...s, date: getSabbatDate(s, year - 1) })),
      ...sabbats.map(s => ({ ...s, date: getSabbatDate(s, year) })),
      ...sabbats.map(s => ({ ...s, date: getSabbatDate(s, year + 1) }))
    ].sort((a, b) => a.date.getTime() - b.date.getTime());

    for (let i = 0; i < allSabbats.length - 1; i++) {
      if (now >= allSabbats[i].date && now < allSabbats[i+1].date) {
        state = {
          prev: allSabbats[i],
          next: allSabbats[i+1],
          progress: (now.getTime() - allSabbats[i].date.getTime()) / (allSabbats[i+1].date.getTime() - allSabbats[i].date.getTime())
        };
        break;
      }
    }
  }

  onMount(() => {
    updateState();
    const interval = setInterval(updateState, 1000 * 60 * 60); 
    return () => clearInterval(interval);
  });
</script>

{#if state}
  <div class="sabbat-bg-container" aria-hidden="true">
    <!-- Waning (Left) -->
    <div 
      class="sabbat-icon waning" 
      style="opacity: {(1 - state.progress) * 0.15}; transform: scale({1.2 - state.progress * 0.4});"
      title="Waning: {state.prev.name} ({state.prev.english})"
    >
      <svg 
        viewBox="0 0 24 24" 
        width="100%" 
        height="100%" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="1.5" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      >
        {#each state.prev.paths as path}
          <path d={path} />
        {/each}
      </svg>
      <span class="label">{state.prev.name}</span>
      </div>

      <!-- Waxing (Right) -->
      <div 
      class="sabbat-icon waxing" 
      style="opacity: {state.progress * 0.15}; transform: scale({0.9 + state.progress * 0.3});"
      >
      <svg 
        viewBox="0 0 24 24" 
        width="100%" 
        height="100%" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="1.5" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      >
        {#each state.next.paths as path}
          <path d={path} />
        {/each}
      </svg>
      <span class="label">{state.next.name}</span>
      </div>
    </div>
  </div>
{/if}

<style>
  .sabbat-bg-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: -1;
    display: flex;
    overflow: hidden;
  }

  .sabbat-icon {
    position: absolute;
    top: 50%;
    width: min(30vw, 400px);
    height: min(30vw, 400px);
    margin-top: calc(-1 * min(15vw, 200px));
    color: var(--color-primary-500);
    transition: opacity 1s ease, transform 1s ease;
    filter: blur(2px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .label {
    font-size: 1rem;
    text-align: center;
    text-transform: lowercase;
    letter-spacing: 0.1em;
    margin-top: 1rem;
    font-weight: 500;
    line-height: 1.2;
  }

  .waning {
    left: 15%;
    margin-left: calc(-1 * min(15vw, 200px));
  }

  .waxing {
    right: 15%;
    margin-right: calc(-1 * min(15vw, 200px));
  }

  @media (max-width: 800px) {
    .sabbat-icon {
      width: 40vw;
      height: 40vw;
      margin-top: -20vw;
      filter: blur(1px);
    }
    .label { font-size: 0.8rem; }
    .waning { left: 20%; margin-left: -20vw; }
    .waxing { right: 20%; margin-right: -20vw; }
  }
</style>
