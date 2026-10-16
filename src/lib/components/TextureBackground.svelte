<script lang="ts">
  /**
   * TextureBackground — a full-viewport geometric texture behind the page.
   *
   * Every cell holds concentric squares, each turned by the "degree" from the
   * one outside it, with neighbouring cells turning in opposite directions. The
   * squares are inscribed in each other, so lines only meet at corners and
   * never cross.
   *
   * The degree comes from the calendar (see $lib/utils/texture), so the pattern
   * drifts as the day, month, season and Moon change. It is computed in the
   * browser, so it reflects the visitor's own date. It re-checks the date once
   * a minute, so a page left open across midnight picks up the new rules, and
   * re-tiles when the window is resized.
   */
  import { onMount } from "svelte";
  import { degreeFor, linesPathOf, textureTile } from "$lib/utils/texture";

  const REFRESH_INTERVAL_MS = 60 * 1000;
  /** Cell size scales with the window, within a sensible range. */
  const CELL_MIN = 120;
  const CELL_MAX = 200;

  let now = $state<Date | null>(null);
  let viewportWidth = $state(0);

  // Whole, even pixels, so tile seams land on pixel edges.
  const cell = $derived(
    Math.min(CELL_MAX, Math.max(CELL_MIN, 2 * Math.round(viewportWidth / 16))),
  );
  const tile = $derived(
    now ? linesPathOf(textureTile(degreeFor(now), cell)) : "",
  );

  onMount(() => {
    now = new Date();
    viewportWidth = window.innerWidth;
    const interval = setInterval(() => (now = new Date()), REFRESH_INTERVAL_MS);

    let frame = 0;
    const handleResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => (viewportWidth = window.innerWidth));
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
  {#if tile}
    <defs>
      <!-- A tile is 2×2 cells: the alternating turn repeats every two. -->
      <pattern
        id="texture-wallpaper"
        width={cell * 2}
        height={cell * 2}
        patternUnits="userSpaceOnUse"
        patternTransform="translate(0.5 0.5)"
      >
        <path d={tile} />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#texture-wallpaper)" />
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
    stroke-linejoin: round;
  }

  /* Anyone asking for more contrast gets plain paper behind the text. */
  @media (prefers-contrast: more), (forced-colors: active) {
    .texture-bg {
      display: none;
    }
  }
</style>
