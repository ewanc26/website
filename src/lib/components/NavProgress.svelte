<script lang="ts">
  /**
   * An ink rule along the top edge while the next page loads. Records come
   * from a PDS and can take a moment; without this a click looks ignored.
   */
  import { navigating } from "$app/state";

  const busy = $derived(navigating.to !== null && navigating.to.url.pathname !== navigating.from?.url.pathname);
</script>

{#if busy}
  <div class="nav-progress" aria-hidden="true"></div>
{/if}
<p class="sr-only" role="status">{busy ? "Loading page" : ""}</p>

<style>
  .nav-progress {
    position: fixed;
    z-index: 90;
    top: 0;
    left: var(--rail);
    right: 0;
    height: 6px;
    background: var(--riso-a-text);
    transform-origin: left;
    pointer-events: none;
    /* Waits a beat so quick pages show nothing, then creeps without ever
       claiming to be finished. */
    animation: nav-progress 8s cubic-bezier(0.1, 0.7, 0.2, 1) 150ms both;
  }
  @keyframes nav-progress {
    from {
      transform: scaleX(0);
    }
    to {
      transform: scaleX(0.92);
    }
  }
  /* A still rule says the same thing. */
  @media (prefers-reduced-motion: reduce) {
    .nav-progress {
      animation: none;
    }
  }
</style>
