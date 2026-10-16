<script lang="ts">
  /**
   * TextureBackground — a full-viewport field of flowing arcs behind the page.
   *
   * Each square tile holds six quarter-circle arcs. Every tile is either
   * unflipped or flipped, which is fixed by a hash of its position, and the
   * arcs meet each tile edge at the same three points, so they join up across
   * tiles and run on as long unbroken curves. No grid is ever drawn.
   *
   * The degree comes from the calendar (see $lib/utils/texture). It tilts the
   * whole field by that many degrees and sets what share of tiles are flipped,
   * sliding the texture between long ordered diagonal waves and a denser maze
   * as the day, month, season and Moon change. Every rule is a smooth window on
   * continuous time, so the degree drifts and never jumps, and a tile that is
   * turning over cross-fades between its two orientations instead of popping.
   * It is computed in the browser, so it reflects the visitor's own date, and
   * is re-checked once a minute (a minute moves the degree by under 0.01°). It
   * is redrawn when the window is resized.
   */
  import { onMount } from "svelte";
  import { arcsPathOf, degreeFor, textureLayers } from "$lib/utils/texture";

  const REFRESH_INTERVAL_MS = 60 * 1000;
  /** Tile size scales with the window, within a sensible range. */
  const TILE_MIN = 72;
  const TILE_MAX = 110;

  let now = $state<Date | null>(null);
  let width = $state(0);
  let height = $state(0);

  const tile = $derived(
    Math.min(TILE_MAX, Math.max(TILE_MIN, Math.round(width / 14))),
  );
  const degree = $derived(now ? degreeFor(now) : null);
  const layers = $derived(
    degree !== null && width > 0
      ? textureLayers(width, height, tile, degree)
      : null,
  );
  // Tiles that are wholly one way or the other share a single path; the few
  // mid-fade get a path each at their own strength.
  const solid = $derived(layers ? arcsPathOf(layers.solid) : "");
  const fades = $derived(
    layers
      ? layers.fades.map((fade) => ({
          opacity: fade.opacity,
          d: arcsPathOf(fade.arcs),
        }))
      : [],
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
  {#if layers}
    <!-- The arcs are drawn around the window's centre, then tilted by the degree. -->
    <g transform="translate({width / 2} {height / 2}) rotate({layers.angle})">
      <path d={solid} />
      {#each fades as fade, k (k)}
        <path d={fade.d} opacity={fade.opacity} />
      {/each}
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
  }

  /* Anyone asking for more contrast gets plain paper behind the text. */
  @media (prefers-contrast: more), (forced-colors: active) {
    .texture-bg {
      display: none;
    }
  }
</style>
