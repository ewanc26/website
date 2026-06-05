<script lang="ts">
  import { onMount } from 'svelte';
  
  import Imbolc from '$lib/components/icons/sabbats/Imbolc.svelte';
  import Ostara from '$lib/components/icons/sabbats/Ostara.svelte';
  import Beltane from '$lib/components/icons/sabbats/Beltane.svelte';
  import Litha from '$lib/components/icons/sabbats/Litha.svelte';
  import Lughnasadh from '$lib/components/icons/sabbats/Lughnasadh.svelte';
  import Mabon from '$lib/components/icons/sabbats/Mabon.svelte';
  import Samhain from '$lib/components/icons/sabbats/Samhain.svelte';
  import Yule from '$lib/components/icons/sabbats/Yule.svelte';

  let { simulatedDate = $bindable(null) } = $props();

  const sabbats = [
    { name: 'Imbolc', month: 2, day: 1, component: Imbolc },
    { name: 'Ostara', month: 3, day: 21, component: Ostara },
    { name: 'Beltane', month: 5, day: 1, component: Beltane },
    { name: 'Litha', month: 6, day: 21, component: Litha },
    { name: 'Lughnasadh', month: 8, day: 1, component: Lughnasadh },
    { name: 'Mabon', month: 9, day: 21, component: Mabon },
    { name: 'Samhain', month: 10, day: 31, component: Samhain },
    { name: 'Yule', month: 12, day: 21, component: Yule }
  ];

  type ActiveState = {
    prev: typeof sabbats[0];
    next: typeof sabbats[0];
    progress: number;
  };

  let state = $state<ActiveState | null>(null);

  function updateState() {
    const now = simulatedDate || new Date();
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

  $effect(() => {
    updateState();
  });

  onMount(() => {
    updateState();
    // Check every minute instead of every hour for better responsiveness
    const interval = setInterval(updateState, 1000 * 60); 
    return () => clearInterval(interval);
  });
</script>

{#if state}
  <div class="sabbat-bg-container" aria-hidden="true">
    <!-- Waning (Left) -->
    <div 
      class="sabbat-icon waning" 
      style="opacity: {(1 - state.progress) * 0.15}; transform: scale({1.2 - state.progress * 0.3});"
    >
      <div class="icon-wrap">
        {#if state.prev.name === 'Imbolc'}<Imbolc size={150} strokeWidth={1.5} />
        {:else if state.prev.name === 'Ostara'}<Ostara size={150} strokeWidth={1.5} />
        {:else if state.prev.name === 'Beltane'}<Beltane size={150} strokeWidth={1.5} />
        {:else if state.prev.name === 'Litha'}<Litha size={150} strokeWidth={1.5} />
        {:else if state.prev.name === 'Lughnasadh'}<Lughnasadh size={150} strokeWidth={1.5} />
        {:else if state.prev.name === 'Mabon'}<Mabon size={150} strokeWidth={1.5} />
        {:else if state.prev.name === 'Samhain'}<Samhain size={150} strokeWidth={1.5} />
        {:else if state.prev.name === 'Yule'}<Yule size={150} strokeWidth={1.5} />
        {/if}
      </div>
      <span class="label">{state.prev.name}</span>
    </div>

    <!-- Waxing (Right) -->
    <div 
      class="sabbat-icon waxing" 
      style="opacity: {state.progress * 0.15}; transform: scale({0.9 + state.progress * 0.3});"
    >
      <div class="icon-wrap">
        {#if state.next.name === 'Imbolc'}<Imbolc size={150} strokeWidth={1.5} />
        {:else if state.next.name === 'Ostara'}<Ostara size={150} strokeWidth={1.5} />
        {:else if state.next.name === 'Beltane'}<Beltane size={150} strokeWidth={1.5} />
        {:else if state.next.name === 'Litha'}<Litha size={150} strokeWidth={1.5} />
        {:else if state.next.name === 'Lughnasadh'}<Lughnasadh size={150} strokeWidth={1.5} />
        {:else if state.next.name === 'Mabon'}<Mabon size={150} strokeWidth={1.5} />
        {:else if state.next.name === 'Samhain'}<Samhain size={150} strokeWidth={1.5} />
        {:else if state.next.name === 'Yule'}<Yule size={150} strokeWidth={1.5} />
        {/if}
      </div>
      <span class="label">{state.next.name}</span>
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
  
  .icon-wrap {
    width: 100%;
    height: 100%;
    display: flex;
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
    width: 100%;
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
