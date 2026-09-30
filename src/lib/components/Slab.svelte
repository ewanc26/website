<script lang="ts">
  /**
   * The page word: colossal, cropped by the sheet, printed twice — once in
   * each ink, the second plate a hair out of register.
   */
  import SigilBand from "$lib/components/SigilBand.svelte";

  interface Props {
    word: string;
    long?: boolean;
    sigils?: boolean;
  }
  let { word, long = false, sigils = true }: Props = $props();
</script>

{#if sigils}
  <SigilBand seed={word} />
{/if}
<h1 class="slab" class:slab--long={long} data-t={word} style={`--n:${word.length + (word.length <= 3 ? 0.6 : 0)}`}>
  {word}
</h1>
