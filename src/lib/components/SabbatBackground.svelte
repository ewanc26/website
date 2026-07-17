<script lang="ts">
  /** A restrained celestial layer behind the seasonally coloured page. */
  import { onMount } from 'svelte';

  import MoonPhase from '$lib/components/icons/MoonPhase.svelte';
  import Pentacle from '$lib/components/icons/Pentacle.svelte';
  import { getMoonIllumination } from '$lib/utils/moonPhase';

  let { simulatedDate = $bindable(null) } = $props();
  let moonPhase = $state<number | null>(null);

  function updateState() {
    const now = simulatedDate || new Date();
    moonPhase = getMoonIllumination(now).phase;
  }

  $effect(() => {
    updateState();
  });

  onMount(() => {
    updateState();
    const interval = setInterval(updateState, 1000 * 60);
    return () => clearInterval(interval);
  });
</script>

{#if moonPhase !== null}
  <div class="sabbat-bg-container" aria-hidden="true">
    <div class="lunar-background">
      <MoonPhase phase={moonPhase} size="100%" />
    </div>

    <div class="background-pentacle pentacle-one"><Pentacle size="100%" /></div>
    <div class="background-pentacle pentacle-two"><Pentacle size="100%" /></div>
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
    overflow: hidden;
  }

  .lunar-background {
    position: absolute;
    top: clamp(5rem, 12vh, 9rem);
    left: 50%;
    width: min(22vw, 260px);
    aspect-ratio: 1;
    color: var(--color-secondary-500);
    opacity: 0.045;
    transform: translateX(-50%);
  }

  .background-pentacle {
    position: absolute;
    width: clamp(34px, 4vw, 64px);
    aspect-ratio: 1;
    color: var(--color-primary-500);
    opacity: 0.028;
  }

  .pentacle-one {
    top: 24%;
    left: 6%;
    rotate: -12deg;
  }

  .pentacle-two {
    right: 6%;
    bottom: 12%;
    rotate: 9deg;
  }

  @media (max-width: 800px) {
    .lunar-background { width: min(38vw, 200px); opacity: 0.035; }
    .background-pentacle { opacity: 0.022; }
  }

</style>
