<script lang="ts">
  import { getSabbatContext, getThemeShade } from '$lib/utils/theme';

  let simulatedDate = $state(new Date());
  let isAnimating = $state(false);

  function getColoursForDate(date: Date) {
    const { prev, next } = getSabbatContext(date);

    return {
      primary: getThemeShade(date, 'primary', 500, 'light'),
      secondary: getThemeShade(date, 'secondary', 500, 'light'),
      accent: getThemeShade(date, 'accent', 500, 'light'),
      prevName: prev.name,
      nextName: next.name,
    };
  }

  let colours = $derived(getColoursForDate(simulatedDate));

  $effect(() => {
    if (isAnimating) {
      let frame = requestAnimationFrame(function loop() {
        simulatedDate = new Date(simulatedDate.getTime() + 1000 * 60 * 60 * 24 * 2); // Advance 2 days per frame
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
    <div class="slider-container" class:hidden={isAnimating}>
      <label>
        Date: {simulatedDate.toLocaleDateString('en-gb')}
        <input type="range" min={new Date(2026, 0, 1).getTime()} max={new Date(2027, 0, 1).getTime()} 
               value={simulatedDate.getTime()} oninput={(e) => simulatedDate = new Date(Number(e.currentTarget.value))} />
      </label>
    </div>
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
    color-scheme: light;
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
    color: var(--color-canvas-50);
    font-weight: 800;
    font-size: var(--text-xs);
  }
  .controls { display: flex; flex-direction: column; gap: var(--space-xs); }
  .slider-container {
    transition: opacity var(--duration-normal) var(--ease-out-quart), visibility var(--duration-normal), height var(--duration-normal) var(--ease-out-quart);
    opacity: 1;
    visibility: visible;
    height: auto;
    overflow: hidden;
  }
  .slider-container.hidden {
    opacity: 0;
    visibility: hidden;
    height: 0;
    margin: 0;
    pointer-events: none;
  }
  .status { font-family: var(--font-mono); font-size: var(--text-xs); margin: 0; color: var(--color-text-600); }
</style>
