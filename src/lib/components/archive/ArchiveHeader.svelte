<script lang="ts">
  import { formatNumber } from "$utils/formatters";
  import { calculateTotalReadTime, calculateTotalWordCount, formatReadTime } from "$utils/tally";
  import DocumentIcon from "$components/icons/utility/DocumentIcon.svelte";

  export let groupedByYear: any[];

  $: totalPosts = groupedByYear.reduce((total, yearGroup) => {
    return total + Object.values(yearGroup.months).reduce((yearTotal: number, postsInMonth) => {
      return yearTotal + (postsInMonth as any[]).length;
    }, 0);
  }, 0);

  $: allPosts = groupedByYear.flatMap(yearGroup =>
    Object.values(yearGroup.months).flatMap((postsInMonth) => postsInMonth as any[])
  );

  $: rawTotalReadTime = calculateTotalReadTime(allPosts);
  $: totalReadTime = formatReadTime(rawTotalReadTime);
  $: totalWordCount = calculateTotalWordCount(allPosts);

  $: postLabel = totalPosts === 1 ? "post" : "posts";
  $: wordLabel = totalWordCount === 1 ? "word" : "words";
</script>

<header 
  class="mb-2 pl-4"
>
  <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-4">
    
    <!-- Left: Title & Subtitle -->
    <div class="flex items-start gap-4">
      <div class="flex items-center justify-center w-14 h-14 bg-button text-text rounded-2xl shadow-sm">
        <DocumentIcon size="28" />
      </div>
      <div>
        <h1 class="text-3xl font-extrabold text-primary leading-tight tracking-tight">Blog Archive</h1>
        <p class="text-sm text-text/80 mt-1">Unapologetically me</p>
      </div>
    </div>

    <!-- Right: Stats -->
    <div class="flex items-center gap-8">
      <div class="flex flex-col items-center">
        <span class="text-2xl font-bold text-primary">{formatNumber(totalPosts)}</span>
        <span class="text-xs text-text/70 uppercase tracking-wide">{postLabel}</span>
      </div>

      <div class="w-px h-8 bg-text/20"></div>

      <div class="flex gap-6">
        <div class="flex flex-col items-center">
          <span class="text-lg font-semibold text-text">{totalReadTime}</span>
          <span class="text-xs text-text/70 uppercase tracking-wide">Read Time</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="text-lg font-semibold text-text">{formatNumber(totalWordCount)}</span>
          <span class="text-xs text-text/70 uppercase tracking-wide">{wordLabel}</span>
        </div>
      </div>
    </div>
  </div>
</header>