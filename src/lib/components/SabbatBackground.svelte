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

  /* Both symbols breathe: a slow opacity drift, not a fixed value. Per
     DESIGN.md, "Sabbat icons wax and wane in the background" — this is
     that requirement, not decoration. Amplitude stays within the existing
     restrained opacity band so it reads as ambient, not attention-seeking. */

  /* --peak holds each element's resting opacity; the keyframe animates
     as a fraction of it, so the mobile override below (which sets a
     different --peak) still breathes within its own, smaller band. */
  .lunar-background {
    position: absolute;
    top: clamp(5rem, 12vh, 9rem);
    left: 50%;
    width: min(22vw, 260px);
    aspect-ratio: 1;
    color: var(--color-secondary-500);
    --peak: 0.045;
    opacity: var(--peak);
    transform: translateX(-50%);
    animation: wax-wane var(--duration-breath) var(--ease-out-quart) infinite;
  }

  .background-pentacle {
    position: absolute;
    width: clamp(34px, 4vw, 64px);
    aspect-ratio: 1;
    color: var(--color-primary-500);
    --peak: 0.028;
    opacity: var(--peak);
    animation: wax-wane var(--duration-breath) var(--ease-out-quart) infinite;
  }

  .pentacle-one {
    top: 24%;
    left: 6%;
    rotate: -12deg;
    /* A third and two-thirds out of phase with the moon and each other,
       so all three share one rate but never move in lockstep. */
    animation-delay: calc(var(--duration-breath) / -3);
  }

  .pentacle-two {
    right: 6%;
    bottom: 12%;
    rotate: 9deg;
    animation-delay: calc(var(--duration-breath) / -3 * 2);
  }

  /* Each symbol drifts between roughly half and full of its own resting
     opacity, at its own offset (negative animation-delay starts partway
     through the cycle), so the two pentacles and the moon never move in
     lockstep. */
  @keyframes wax-wane {
    0%, 100% {
      opacity: calc(var(--peak) * 0.5);
    }
    50% {
      opacity: var(--peak);
    }
  }

  @media (max-width: 800px) {
    .lunar-background { width: min(38vw, 200px); --peak: 0.035; }
    .background-pentacle { --peak: 0.022; }
  }

  @media (prefers-reduced-motion: reduce) {
    .lunar-background,
    .background-pentacle {
      animation: none;
    }
  }

</style>
