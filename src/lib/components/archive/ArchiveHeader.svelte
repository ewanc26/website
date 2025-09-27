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

<header class="mb-2 px-4 sm:px-6">
  <div class="max-w-7xl mx-auto">
    <!-- Main content container with better responsive flow -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-4 lg:gap-8 pb-3 sm:pb-4 lg:pb-6">
      
      <!-- Left: Title & Subtitle -->
      <div class="flex items-center gap-4 sm:gap-5">
        <div class="flex-shrink-0 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-card rounded-xl shadow-sm">
          <DocumentIcon size="24"/>
        </div>
        <div class="min-w-0 flex-1">
          <h1 class="text-2xl sm:text-3xl font-extrabold text-primary leading-tight tracking-tight">
            Blog Archive
          </h1>
          <p class="text-xs sm:text-sm text-text/80 mt-1">Unapologetically me</p>
        </div>
      </div>

      <!-- Right: Stats with improved responsive layout and no wrapping -->
      <div class="flex items-center justify-center lg:justify-end flex-shrink-0">
        <div class="flex items-center gap-4 sm:gap-6 lg:gap-8">
          
          <!-- Posts stat -->
          <div class="flex flex-col items-center flex-shrink-0 min-w-0">
            <span class="text-lg sm:text-xl lg:text-2xl font-bold text-primary tabular-nums whitespace-nowrap">
              {formatNumber(totalPosts)}
            </span>
            <span class="text-xs text-text/70 uppercase tracking-wide font-medium whitespace-nowrap">
              {postLabel}
            </span>
          </div>

          <!-- Read time stat -->
          <div class="flex flex-col items-center flex-shrink-0 min-w-0">
            <span class="text-sm sm:text-base lg:text-lg font-semibold text-text tabular-nums whitespace-nowrap">
              {totalReadTime}
            </span>
            <span class="text-xs text-text/70 uppercase tracking-wide font-medium whitespace-nowrap">
              Read Time
            </span>
          </div>

          <!-- Word count stat -->
          <div class="flex flex-col items-center flex-shrink-0 min-w-0">
            <span class="text-sm sm:text-base lg:text-lg font-semibold text-text tabular-nums whitespace-nowrap">
              {formatNumber(totalWordCount)}
            </span>
            <span class="text-xs text-text/70 uppercase tracking-wide font-medium whitespace-nowrap">
              {wordLabel}
            </span>
          </div>
          
        </div>
      </div>
    </div>
  </div>
</header>