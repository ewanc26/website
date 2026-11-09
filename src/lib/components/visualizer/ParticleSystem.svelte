<script lang="ts">
  /**
   * ParticleSystem - Reusable animated particle system for visualizations
   * 
   * Renders animated particles with configurable appearance and behavior
   */
  import type { Snippet } from "svelte";

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    type: string;
    age: number;
    isTeal?: boolean;
  }

  interface Props {
    particles: Particle[];
    width: number;
    height: number;
    maxAge?: number;
  }

  let { particles, width, height, maxAge = 200 }: Props = $props();

  // Animation frame
  let animationFrame: number | null = null;

  // Update particles on each frame
  function animate() {
    particles = particles.map((p) => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      age: p.age + 0.1,
    }));

    // Remove particles that are too old or out of bounds
    particles = particles.filter(
      (p) =>
        p.age < maxAge &&
        p.x >= -50 &&
        p.x <= width + 50 &&
        p.y >= -50 &&
        p.y <= height + 50,
    );

    animationFrame = requestAnimationFrame(animate);
  }

  // Start animation on mount
  $effect(() => {
    animationFrame = requestAnimationFrame(animate);
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  });
</script>

<svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
  {#each particles as p, i (i)}
    <circle
      cx={p.x}
      cy={p.y}
      r={p.size / 2}
      fill={p.color}
      opacity={Math.min(1, 1 - p.age / maxAge)}
      class="particle"
    />
  {/each}
</svg>

<style>
  svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .particle {
    transition: opacity var(--duration-fast) var(--ease-out-quart);
    filter: drop-shadow(0 0 4px currentColor);
  }
</style>
