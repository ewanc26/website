<script lang="ts">
  import { fly } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { formatNumber } from "$utils/formatters";
  import { calculateTotalReadTime, calculateTotalWordCount, formatReadTime } from "$utils/tally";
  import DocumentIcon from "$components/icons/utility/DocumentIcon.svelte";

  export let groupedByYear: any[];

  // Calculate total posts across all years
  $: totalPosts = groupedByYear.reduce((total, yearGroup) => {
    return total + Object.values(yearGroup.months).reduce((yearTotal: number, postsInMonth) => {
      return yearTotal + (postsInMonth as any[]).length;
    }, 0);
  }, 0);

  // Calculate total stats across all posts
  $: allPosts = groupedByYear.flatMap(yearGroup => 
    Object.values(yearGroup.months).flatMap((postsInMonth) => postsInMonth as any[])
  );
  
  $: rawTotalReadTime = calculateTotalReadTime(allPosts);
  $: totalReadTime = formatReadTime(rawTotalReadTime);
  $: totalWordCount = calculateTotalWordCount(allPosts);

  // Labels for singular/plural
  $: postLabel = totalPosts === 1 ? "post" : "posts";
  $: wordLabel = totalWordCount === 1 ? "word" : "words";
</script>

<header 
  class="archive-header"
  in:fly={{ y: -20, duration: 400, delay: 0, easing: quintOut }}
>
  <div class="header-content">
    <div class="title-section">
      <div class="icon-wrapper">
        <DocumentIcon size="24" />
      </div>
      <h1 class="archive-title">Blog Archive</h1>
    </div>
    
    <div class="stats-section">
      <div class="primary-stat">
        <span class="stat-number">{formatNumber(totalPosts)}</span>
        <span class="stat-label">{postLabel}</span>
      </div>
      
      <div class="divider">•</div>
      
      <div class="secondary-stats">
        <span class="stat-item">
          <span class="stat-value">{totalReadTime}</span>
          <span class="stat-sub-label">read time</span>
        </span>
        <span class="stat-item">
          <span class="stat-value">{formatNumber(totalWordCount)}</span>
          <span class="stat-sub-label">{wordLabel}</span>
        </span>
      </div>
    </div>
  </div>
</header>

<style>
  .archive-header {
    margin-bottom: 16px;
    padding: 0 16px;
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    padding-bottom: 16px;
  }

  .title-section {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: var(--button-bg);
    border-radius: 12px;
    color: var(--text-color);
    transition: all 0.3s ease;
  }

  .archive-title {
    font-size: 2rem;
    font-weight: 700;
    color: var(--link-color);
    margin: 0;
    letter-spacing: -0.02em;
  }

  .stats-section {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 0.95rem;
  }

  .primary-stat {
    display: flex;
    align-items: baseline;
    gap: 6px;
  }

  .stat-number {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--link-color);
    line-height: 1;
  }

  .stat-label {
    font-weight: 500;
    color: var(--text-color);
    opacity: 0.8;
  }

  .divider {
    color: var(--text-color);
    opacity: 0.4;
    font-weight: bold;
  }

  .secondary-stats {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 0.85rem;
  }

  .stat-item {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  .stat-value {
    font-weight: 600;
    color: var(--text-color);
  }

  .stat-sub-label {
    font-weight: 400;
    color: var(--text-color);
    opacity: 0.7;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .header-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }

    .archive-title {
      font-size: 1.75rem;
    }

    .stats-section {
      align-self: stretch;
      justify-content: space-between;
    }

    .secondary-stats {
      flex-direction: row;
      gap: 12px;
    }

    .stat-item {
      flex-direction: column;
      gap: 0;
      text-align: right;
    }
  }

  @media (max-width: 640px) {
    .archive-header {
      padding: 0 8px;
    }

    .title-section {
      gap: 8px;
    }

    .icon-wrapper {
      width: 40px;
      height: 40px;
    }

    .archive-title {
      font-size: 1.5rem;
    }

    .stat-number {
      font-size: 1.25rem;
    }

    .secondary-stats {
      font-size: 0.8rem;
    }
  }
</style>