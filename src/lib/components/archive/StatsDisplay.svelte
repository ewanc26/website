<script lang="ts">
  import { formatNumber } from "$utils/numberFormatter";

  export let totalReadTime: string;
  export let totalWordCount: number;
  export let postCount: number | undefined = undefined;

  // Determine singular or plural for word count
  $: wordLabel = totalWordCount === 1 ? "word" : "words";
  $: postLabel = postCount === 1 ? "post" : "posts";
</script>

{#if postCount !== undefined}
  <p class="text-sm opacity-50 mb-4 ml-2">
    {totalReadTime} read time • {formatNumber(totalWordCount)}
    {wordLabel} • {formatNumber(postCount)}
    {postLabel}
  </p>
{:else}
  <div class="mb-6 ml-4 text-sm opacity-70">
    <p>Total Read Time: {totalReadTime}</p>
    <p>Total Word Count: {formatNumber(totalWordCount)} {wordLabel}</p>
  </div>
{/if}