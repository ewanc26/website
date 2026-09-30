<script lang="ts">
  /** A decorative barcode drawn from the characters of a string (the DID). */
  interface Props {
    value: string;
  }
  let { value }: Props = $props();

  const result = $derived.by(() => {
    let x = 0;
    const bars: { x: number; w: number }[] = [];
    for (const ch of value) {
      const n = ch.charCodeAt(0);
      for (let b = 0; b < 5; b++) {
        const w = ((n >> b) & 1) + 1;
        if (b % 2 === 0) bars.push({ x, w });
        x += w;
      }
      x += 1;
    }
    return { bars, x };
  });
</script>

<svg class="barcode" viewBox={`0 0 ${result.x} 10`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
  {#each result.bars as b, i (i)}
    <rect x={b.x} y="0" width={b.w} height="10" fill="currentColor" />
  {/each}
</svg>
