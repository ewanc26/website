<script lang="ts">
  /**
   * TextureBackground — a full-viewport field of flowing contour lines behind
   * the page, like the lines of a relief map or a tide pattern.
   *
   * The lines are contours of one smooth field made of a few overlapping waves
   * (see $lib/utils/texture). There are no tiles and no grid, and nothing ever
   * switches: the pattern is a continuous function of the date, so it can only
   * transition. Lines never cross.
   *
   * The degree comes from the calendar. It tilts the whole field by that many
   * degrees and sets how far it morphs, from long parallel wavy bands into a
   * lattice of closed loops, as the day, month, season and Moon change. Every
   * rule is a smooth window on continuous time, so the degree drifts and never
   * jumps. It is computed in the browser, so it reflects the visitor's own
   * date, and is re-checked once a minute (a minute moves the degree by under
   * 0.01°, so the lines creep rather than jump). It is redrawn when the window
   * is resized.
   */
  import { onMount } from "svelte";
  import { degreeFor, texturePath } from "$lib/utils/texture";

  const REFRESH_INTERVAL_MS = 60 * 1000;

  let now = $state<Date | null>(null);
  let width = $state(0);
  let height = $state(0);

  const path = $derived(
    now && width > 0 ? texturePath(width, height, degreeFor(now)) : "",
  );

  onMount(() => {
    const measure = () => {
      width = window.innerWidth;
      height = window.innerHeight;
    };
    measure();
    now = new Date();
    const interval = setInterval(() => (now = new Date()), REFRESH_INTERVAL_MS);

    let frame = 0;
    const handleResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
    };
  });
</script>

<svg class="texture-bg" aria-hidden="true" focusable="false">
  {#if path}
    <!-- The lines are drawn around the window's centre. -->
    <g transform="translate({width / 2} {height / 2})">
      <path d={path} />
    </g>
  {/if}
</svg>

<style>
  .texture-bg {
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

  .texture-bg path {
    fill: none;
    stroke: var(--ink);
    stroke-width: 1;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  /* Anyone asking for more contrast gets plain paper behind the text. */
  @media (prefers-contrast: more), (forced-colors: active) {
    .texture-bg {
      display: none;
    }
  }
</style>
