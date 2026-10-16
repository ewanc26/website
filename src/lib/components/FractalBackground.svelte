<script lang="ts">
  /**
   * FractalBackground — a full-viewport SVG fractal behind the page.
   *
   * The branch angle comes from the calendar (see $lib/utils/fractal), so the
   * picture drifts as the day, month and season change. It is computed in the
   * browser, so it reflects the visitor's own date. It re-checks the date once
   * a minute, so a page left open across midnight picks up the new rules.
   */
  import { onMount } from "svelte";
  import {
    buildFractalPath,
    degreeFor,
    FRACTAL_DEPTH,
  } from "$lib/utils/fractal";

  const REFRESH_INTERVAL_MS = 60 * 1000;

  let now = $state<Date | null>(null);

  const path = $derived(
    now ? buildFractalPath(degreeFor(now), FRACTAL_DEPTH) : "",
  );

  onMount(() => {
    now = new Date();
    const interval = setInterval(() => (now = new Date()), REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  });
</script>

<svg
  class="fractal-bg"
  viewBox="0 0 1000 1000"
  preserveAspectRatio="xMidYMax slice"
  aria-hidden="true"
  focusable="false"
>
  <path d={path} />
</svg>

<style>
  .fractal-bg {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    /* Above the body paper, below .shell-main (z-index 1). */
    z-index: 0;
    pointer-events: none;
    /* Low-key on purpose: a faint impression in the paper, not artwork. The
       ink colour flips with the theme, so it stays quiet in light and dark. */
    opacity: 0.06;
  }

  .fractal-bg path {
    fill: none;
    stroke: var(--ink);
    stroke-width: 1;
    stroke-linecap: round;
    vector-effect: non-scaling-stroke;
  }

  /* Anyone asking for more contrast gets plain paper behind the text. */
  @media (prefers-contrast: more), (forced-colors: active) {
    .fractal-bg {
      display: none;
    }
  }
</style>
