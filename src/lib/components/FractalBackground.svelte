<script lang="ts">
  /**
   * FractalBackground — a full-viewport fractal wallpaper behind the page.
   *
   * One tree is drawn per wallpaper cell, repeated edge to edge in a half-drop
   * (brick) layout so the whole page is covered. Every tree is scaled to sit
   * inside its own padded cell, and cells never intersect, so neither branches
   * nor neighbouring trees ever overlap.
   *
   * The branch angle comes from the calendar (see $lib/utils/fractal), so the
   * pattern drifts as the day, month and season change. It is computed in the
   * browser, so it reflects the visitor's own date. It re-checks the date once
   * a minute, so a page left open across midnight picks up the new rules, and
   * re-tiles when the window is resized.
   */
  import { onMount } from "svelte";
  import {
    buildFractalSegments,
    cellWidthFor,
    degreeFor,
    fitTree,
    fractalPathOf,
  } from "$lib/utils/fractal";

  const REFRESH_INTERVAL_MS = 60 * 1000;
  /** Cell height scales with the window, within a sensible size range. */
  const CELL_MIN = 140;
  const CELL_MAX = 240;

  let now = $state<Date | null>(null);
  let viewportWidth = $state(0);

  const cellH = $derived(
    Math.min(CELL_MAX, Math.max(CELL_MIN, Math.round(viewportWidth / 6))),
  );

  const segments = $derived(now ? buildFractalSegments(degreeFor(now)) : []);
  const path = $derived(fractalPathOf(segments));
  // The cell is as wide as the tree needs, so trees pack tightly.
  const cellW = $derived(
    segments.length ? cellWidthFor(segments, cellH) : cellH,
  );
  const fit = $derived(
    segments.length ? fitTree(segments, cellW, cellH) : null,
  );

  /** A tree in the cell whose top-left corner is (x, y) in the tile. */
  const place = (x: number, y: number) =>
    fit
      ? `translate(${x + fit.tx} ${y + fit.ty}) scale(${fit.scale})`
      : undefined;

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

<svg class="fractal-bg" aria-hidden="true" focusable="false">
  {#if fit}
    <defs>
      <!-- Stroke width is divided by the scale so lines stay 1px on screen. -->
      <path id="fractal-tree" d={path} stroke-width={1 / fit.scale} />
      <!-- Two rows tall: one tree in row one, and the second row offset by half
           a cell, drawn as two halves that join across the tile edge. -->
      <pattern
        id="fractal-wallpaper"
        width={cellW}
        height={cellH * 2}
        patternUnits="userSpaceOnUse"
      >
        <use href="#fractal-tree" transform={place(0, 0)} />
        <use href="#fractal-tree" transform={place(-cellW / 2, cellH)} />
        <use href="#fractal-tree" transform={place(cellW / 2, cellH)} />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#fractal-wallpaper)" />
  {/if}
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
    stroke-linecap: round;
  }

  /* Anyone asking for more contrast gets plain paper behind the text. */
  @media (prefers-contrast: more), (forced-colors: active) {
    .fractal-bg {
      display: none;
    }
  }
</style>
