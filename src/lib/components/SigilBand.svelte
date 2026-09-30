<script lang="ts">
  import Pentacle from "$lib/components/icons/Pentacle.svelte";
  import Triskele from "$lib/components/icons/Triskele.svelte";

  interface Props {
    seed?: string;
    side?: boolean;
  }
  let { seed = "", side = false }: Props = $props();

  type Mark = [kind: "p" | "t", x: number, y: number, size: number, rot: number];
  const layouts: Mark[][] = [
    [
      ["p", 2, 0.6, 3, -12],
      ["t", 28, 1.9, 2, 20],
      ["p", 54, 0.2, 1.8, 8],
      ["t", 79, 1.2, 2.6, -30],
    ],
    [
      ["t", 4, 1.4, 2.2, 30],
      ["p", 30, 0.3, 2.8, 14],
      ["t", 56, 2, 1.8, -18],
      ["p", 80, 0.9, 2.2, -6],
    ],
    [
      ["p", 1, 2, 1.8, 10],
      ["t", 27, 0.4, 2.6, -22],
      ["p", 52, 1.5, 3, -15],
      ["t", 79, 0.2, 2, 25],
    ],
    [
      ["t", 3, 0.5, 2.8, -8],
      ["p", 29, 2.1, 2, 16],
      ["t", 54, 0.4, 2, 34],
      ["p", 78, 1.3, 2.8, -20],
    ],
  ];
  const sideMarks: Mark[] = [
    ["p", 8, 4, 3.4, -10],
    ["t", 56, 14, 2.2, 22],
    ["t", 14, 34, 2.6, 30],
    ["p", 60, 46, 1.8, 12],
    ["p", 22, 62, 2.2, -25],
    ["t", 58, 72, 3, -14],
  ];

  const marks = $derived.by(() => {
    let hash = 0;
    for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
    return side ? sideMarks : layouts[hash % layouts.length];
  });
</script>

<div class="sigil-band" class:sigil-band--side={side} aria-hidden="true">
  {#each marks as [kind, x, y, size, rot], i (i)}
    {@const style = `--x:${x}%;--y:${y}${side ? "%" : "rem"};--s:${size}rem;--r:${rot}deg`}
    {#if kind === "p"}
      <Pentacle size={48} class="sb-a" {style} />
    {:else}
      <Triskele size={48} class="sb-b" {style} />
    {/if}
  {/each}
</div>

<style>
  .sigil-band {
    position: relative;
    height: 4.5rem;
    margin-top: var(--space-lg);
    pointer-events: none;
  }
  .sigil-band--side {
    display: none;
    height: auto;
    margin: 0;
    align-self: stretch;
    flex: 1 1 0;
    min-width: 0;
  }
  @media (min-width: 64rem) {
    .sigil-band--side {
      display: block;
    }
  }
  .sigil-band :global(svg) {
    position: absolute;
    left: var(--x);
    top: var(--y);
    width: var(--s);
    height: var(--s);
    rotate: var(--r);
  }
  .sigil-band :global(.sb-a) {
    color: var(--riso-a);
  }
  .sigil-band :global(.sb-b) {
    color: var(--riso-b);
  }
</style>
