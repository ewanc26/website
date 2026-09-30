<script lang="ts">
  import { Volume2, VolumeX } from "@lucide/svelte";
  import { ambianceEnabled } from "$lib/stores/ambiance";
</script>

<button
  class="footer-link ambiance-toggle active-press"
  aria-label={$ambianceEnabled ? "Mute background ambiance" : "Play background ambiance"}
  aria-pressed={$ambianceEnabled}
  type="button"
  onclick={() => ambianceEnabled.toggle()}
>
  {#if $ambianceEnabled}
    <Volume2 size={14} />
  {:else}
    <VolumeX size={14} />
  {/if}
</button>

<style>
  .footer-link {
    background: none;
    border: none;
    color: var(--color-text-600);
    text-decoration: none;
    white-space: nowrap;
    padding: var(--space-sm); /* Touch target */
    font-size: var(--text-xs);
    cursor: pointer;
    transition: color var(--duration-fast) var(--ease-out-quart);
  }
  .footer-link:hover {
    color: var(--color-primary-700);
  }
  .ambiance-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
</style>
