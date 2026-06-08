<script lang="ts">
  import { onMount } from 'svelte';
  import chroma from 'chroma-js';
  import { sabbats, type Sabbat } from '$lib/utils/sabbats';

  let simulatedDate = $state(new Date());
  let isAnimating = $state(false);

  // Re-calculating colours based on Sabbat rotation (similar logic to theme.ts)
  function getColoursForDate(date: Date) {
    const year = date.getFullYear();
    const getSabbatDate = (s: Sabbat, y: number) => new Date(y, s.month - 1, s.day);
    const allSabbats = [
      ...sabbats.map((s) => ({ ...s, date: getSabbatDate(s, year - 1) })),
      ...sabbats.map((s) => ({ ...s, date: getSabbatDate(s, year) })),
      ...sabbats.map((s) => ({ ...s, date: getSabbatDate(s, year + 1) })),
    ].sort((a, b) => a.date.getTime() - b.date.getTime());

    let prev = allSabbats[0], next = allSabbats[1];
    for (let i = 0; i < allSabbats.length - 1; i++) {
        if (date >= allSabbats[i].date && date < allSabbats[i + 1].date) {
            prev = allSabbats[i];
            next = allSabbats[i + 1];
            break;
        }
    }

    const prevDate = prev.date.getTime();
    const nextDate = next.date.getTime();
    const progress = (date.getTime() - prevDate) / (nextDate - prevDate);

    // Simplification for demonstrator: interpolate hue
    let diff = next.rotation - prev.rotation;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    const rotation = (prev.rotation + diff * progress + 360) % 360;

    // Base colours (OKLCH L, C, H)
    const primary = chroma.oklch(0.69, 0.15, rotation).hex();
    const secondary = chroma.oklch(0.70, 0.17, (rotation + 45) % 360).hex();
    const accent = chroma.oklch(0.71, 0.17, (rotation + 90) % 360).hex();

    return { primary, secondary, accent, prevName: prev.name, nextName: next.name, progress };
  }

  let colours = $derived(getColoursForDate(simulatedDate));

  // Animation loop
  onMount(() => {
    let frame: number;
    function animate() {
      if (isAnimating) {
        simulatedDate = new Date(simulatedDate.getTime() + 1000 * 60 * 60 * 24 * 2); // Advance 2 days per frame
        frame = requestAnimationFrame(animate);
      }
    }
    if (isAnimating) animate();
    return () => cancelAnimationFrame(frame);
  });

  $effect(() => {
    if (isAnimating) {
      let frame = requestAnimationFrame(function loop() {
          simulatedDate = new Date(simulatedDate.getTime() + 1000 * 60 * 60 * 24 * 2);
          if (isAnimating) frame = requestAnimationFrame(loop);
      });
      return () => cancelAnimationFrame(frame);
    }
  });
</script>

<div class="demo-container">
  <div class="swatches">
    <div class="swatch" style="background: {colours.primary}">Primary</div>
    <div class="swatch" style="background: {colours.secondary}">Secondary</div>
    <div class="swatch" style="background: {colours.accent}">Accent</div>
  </div>
  
  <div class="controls">
    <label>
      Date: {simulatedDate.toLocaleDateString('en-gb')}
      <input type="range" min={new Date(2026, 0, 1).getTime()} max={new Date(2027, 0, 1).getTime()} 
             value={simulatedDate.getTime()} oninput={(e) => simulatedDate = new Date(Number(e.currentTarget.value))} />
    </label>
    <button onclick={() => isAnimating = !isAnimating}>
      {isAnimating ? 'Stop' : 'Animate'}
    </button>
  </div>
  <p class="status">Transitioning from {colours.prevName} to {colours.nextName}</p>
</div>

<style>
  .demo-container {
    padding: var(--space-md);
    border: 1px solid var(--surface-color);
    border-radius: var(--radius-lg);
    background: var(--surface-raised);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }
  .swatches {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-sm);
  }
  .swatch {
    height: 100px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 800;
    font-size: var(--text-xs);
    text-shadow: 0 1px 2px rgba(0,0,0,0.2);
  }
  .controls { display: flex; flex-direction: column; gap: var(--space-xs); }
  .status { font-family: var(--font-mono); font-size: var(--text-xs); margin: 0; color: var(--color-text-600); }
</style>
