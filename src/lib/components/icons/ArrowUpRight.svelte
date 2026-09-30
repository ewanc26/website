<script lang="ts">
  import { ArrowUpRight } from "@lucide/svelte";

  interface Props {
    size?: number | string;
    class?: string;
  }
  let { size = "0.85em", class: className = "" }: Props = $props();
</script>

<ArrowUpRight {size} class={`arrow-ur ${className}`.trim()} aria-hidden="true" />

<style>
  :global(.arrow-ur) {
    display: inline-block;
    vertical-align: -0.05em;
    margin-inline-start: 0.15em;
    flex: none;
  }
</style>
