<script lang="ts">
  import { getMoonPhaseGeometry } from '$lib/utils/moonPhase';

  let { phase, size = 16 }: { phase: number; size?: number | string } = $props();
  const geometry = $derived(getMoonPhaseGeometry(phase));
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  aria-hidden="true"
  class="moon-phase"
>
  <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.14" />

  {#if geometry.isFull}
    <circle cx="12" cy="12" r="9" fill="currentColor" />
  {:else if geometry.path}
    <path
      d={geometry.path}
      fill="currentColor"
      fill-rule={geometry.isGibbous ? 'evenodd' : 'nonzero'}
    />
  {/if}

  <circle
    cx="12"
    cy="12"
    r="9"
    stroke="currentColor"
    stroke-width="1"
    opacity={geometry.isNew ? 0.8 : 0.3}
  />
</svg>

<style>
  .moon-phase {
    display: block;
    flex: 0 0 auto;
  }
</style>
