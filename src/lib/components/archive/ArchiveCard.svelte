<script lang="ts">
  import { fly, fade } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { formatDate, formatNumber } from "$utils/formatters";
  import { getMilestone } from "$utils/milestones";
  import DocumentIcon from "$components/icons/utility/DocumentIcon.svelte";
  import LinkExternalIcon from "$components/icons/utility/LinkExternalIcon.svelte";
  import CoffeeIcon from "$components/icons/utility/CoffeeIcon.svelte";
  import ClockIcon from "$components/icons/utility/ClockIcon.svelte";
  import BookIcon from "$components/icons/utility/BookIcon.svelte";
  import BooksIcon from "$components/icons/utility/BooksIcon.svelte";

  export let type: 'post' | 'link';
  export let post: any = {}; // For post type
  export let title: string = ""; // For link type or post title
  export let url: string = ""; // For link type
  export let value: string = ""; // For link type
  export let monthIndex: number = 0;
  export let postIndex: number = 0;
  export let localeLoaded: boolean = false;
  export let postNumber: number | null = null; // New prop for milestone calculation

  // Reactive variable to store the display date string for posts
  let displayDate: string;

  // Update displayDate whenever post.createdAt or localeLoaded changes for posts
  $: {
    if (type === 'post' && localeLoaded && post?.createdAt) {
      const postDate = new Date(post.createdAt);
      displayDate = formatDate(postDate);
    } else if (type === 'post') {
      displayDate = "Loading...";
    }
  }

  // Calculate milestone information
  $: milestone = type === 'post' && postNumber ? getMilestone(postNumber) : null;

  // Determine the title to display based on type
  $: displayTitle = type === 'post' ? post?.title : title;
  $: href = type === 'post' ? `/blog/${post.rkey}` : url;
  
  // Calculate reading time category for visual styling
  $: readingTime = type === 'post' ? Math.ceil(post.wordCount / 200) : 0;
  $: isLongRead = readingTime > 10;
  $: isMediumRead = readingTime > 5 && readingTime <= 10;
  $: isQuickRead = readingTime <= 2;
  
  // Get appropriate icon based on reading time
  $: getReadingTimeIcon = (time: number) => {
    if (time <= 2) return 'quick'; // Coffee cup for quick reads
    if (time <= 5) return 'short'; // Clock for short reads  
    if (time <= 10) return 'medium'; // Book for medium reads
    return 'long'; // Stack of books for long reads
  };
</script>

<div
  class="archive-card group"
  class:long-read={type === 'post' && isLongRead}
  class:medium-read={type === 'post' && isMediumRead}
  class:has-milestone={milestone}
  in:fly={{
    y: 15,
    x: 0,
    delay: 150 + monthIndex * 30 + postIndex * 50,
    duration: 300,
    easing: quintOut,
  }}
>
  <a {href} class="card-link">
    <article class="card-content">
      <!-- Milestone banner (appears at top if present) -->
      {#if milestone}
        <div 
          class="milestone-banner" 
          class:special={milestone.type === 'special'}
          class:major={milestone.type === 'major'}
          class:minor={milestone.type === 'minor'}
          in:fade={{ delay: 300, duration: 400 }}
        >
          <span class="milestone-emoji" role="img" aria-label="milestone">{milestone.emoji}</span>
          <span class="milestone-text">{milestone.text}</span>
        </div>
      {/if}

      <!-- Header section with title and type indicator -->
      <header class="card-header">
        {#if type === 'post'}
          <div class="type-indicator post-indicator">
            <DocumentIcon size="14" />
            <span class="sr-only">Blog post</span>
          </div>
        {:else}
          <div class="type-indicator link-indicator">
            <LinkExternalIcon size="14" />
            <span class="sr-only">External link</span>
          </div>
        {/if}
        
        <h3 class="card-title" title={displayTitle}>
          {displayTitle}
        </h3>
      </header>

      <!-- Main content area -->
      <div class="card-body">
        {#if type === 'post'}
          <!-- Reading stats with visual emphasis -->
          <div class="reading-stats">
            <div class="stat-item words">
              <span class="stat-number">{formatNumber(post.wordCount) || '0'}</span>
              <span class="stat-label">words</span>
            </div>
            <div class="stat-divider">•</div>
            <div class="stat-item time" class:highlight={isLongRead}>
              <div class="reading-time-icon" class:quick={isQuickRead} class:medium={isMediumRead} class:long={isLongRead}>
                {#if getReadingTimeIcon(readingTime) === 'quick'}
                  <CoffeeIcon size="14" />
                {:else if getReadingTimeIcon(readingTime) === 'short'}
                  <ClockIcon size="14" />
                {:else if getReadingTimeIcon(readingTime) === 'medium'}
                  <BookIcon size="14" />
                {:else}
                  <BooksIcon size="14" />
                {/if}
              </div>
              <span class="stat-number">{Math.ceil(post.wordCount / 200)}</span>
              <span class="stat-label">min read</span>
            </div>
          </div>
        {:else if type === 'link'}
          <p class="link-value">{value}</p>
        {/if}
      </div>

      <!-- Footer with metadata -->
      <footer class="card-footer">
        {#if type === 'post'}
          <div class="date-section">
            <span class="date-label">Last Updated</span>
            <div class="date-value">
              {#if localeLoaded && displayDate !== "Loading..."}
                <span transition:fade>{displayDate}</span>
              {:else}
                <span class="loading">Loading...</span>
              {/if}
            </div>
          </div>
        {:else if type === 'link'}
          <div class="link-domain">
            {url?.replace(/^https?:\/\//, "").split("/")[0]}
          </div>
        {/if}
      </footer>
    </article>
  </a>
</div>

<style>
  .archive-card {
    backface-visibility: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  }

  .card-link {
    display: block;
    text-decoration: none;
    height: 100%;
  }

  .card-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 140px;
    padding: 20px;
    border: 1px solid transparent;
    border-radius: 12px;
    background: var(--header-footer-bg);
    transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .card-content::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--link-color);
    transform: scaleX(0);
    transition: transform 0.3s ease;
    transform-origin: left;
  }

  .group:hover .card-content {
    border-color: var(--button-bg);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  .group:hover .card-content::before {
    transform: scaleX(1);
  }

  /* Disable line animation for milestone cards */
  .has-milestone .card-content::before {
    display: none;
  }

  /* Milestone Banner Styles */
  .milestone-banner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px 12px;
    margin: -20px -20px 16px -20px;
    font-size: 0.85rem;
    font-weight: 600;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .milestone-banner::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% { left: -100%; }
    100% { left: 100%; }
  }

  .milestone-banner.special,
  .milestone-banner.major {
    background: linear-gradient(135deg, var(--button-bg), var(--button-hover-bg));
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .milestone-banner.minor {
    background: var(--button-bg);
    color: var(--text-color);
    opacity: 0.9;
  }

  .milestone-emoji {
    font-size: 1rem;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
  }

  .milestone-text {
    letter-spacing: 0.02em;
  }

  /* Adjust card content when milestone is present */
  .has-milestone .card-header {
    margin-bottom: 12px;
  }

  .has-milestone .card-content {
    min-height: 160px;
  }

  /* Header Styles */
  .card-header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 16px;
  }

  .type-indicator {
    flex-shrink: 0;
    padding: 6px;
    border-radius: 6px;
    margin-top: 2px;
    transition: all 0.3s ease;
  }

  .post-indicator, .link-indicator {
    background: var(--button-bg);
    color: var(--text-color);
    opacity: 0.8;
  }

  .group:hover .type-indicator {
    transform: scale(1.1);
  }

  .card-title {
    flex: 1;
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    line-height: 1.4;
    color: var(--link-color);
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-word;
    transition: color 0.3s ease;
  }

  .group:hover .card-title {
    color: var(--link-hover-color);
  }

  /* Body Styles */
  .card-body {
    flex: 1;
    display: flex;
    align-items: center;
  }

  .reading-stats {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 0.95rem;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .reading-time-icon {
    display: flex;
    align-items: center;
    color: var(--text-color);
    opacity: 0.7;
    transition: all 0.3s ease;
  }

  .stat-number {
    font-weight: 600;
    color: var(--text-color);
  }

  .stat-label {
    font-size: 0.85rem;
    color: var(--text-color);
    opacity: 0.7;
  }

  .stat-item.highlight .stat-number {
    color: var(--link-color);
    font-weight: 700;
  }

  .stat-divider {
    color: var(--text-color);
    opacity: 0.4;
  }

  .link-value {
    color: var(--text-color);
    font-size: 0.9rem;
    line-height: 1.4;
    margin: 0;
  }

  /* Footer Styles */
  .card-footer {
    margin-top: auto;
    padding-top: 16px;
  }

  .date-section {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .date-label {
    font-size: 0.75rem;
    color: var(--text-color);
    opacity: 0.6;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
  }

  .date-value {
    font-size: 0.9rem;
    color: var(--text-color);
    font-weight: 500;
  }

  .loading {
    opacity: 0.5;
    font-style: italic;
  }

  .link-domain {
    font-size: 0.8rem;
    color: var(--text-color);
    opacity: 0.7;
    font-family: monospace;
    background: var(--button-bg);
    padding: 4px 8px;
    border-radius: 4px;
    display: inline-block;
  }

  /* Adaptive sizing based on content */
  .long-read .card-content {
    min-height: 160px;
  }

  .medium-read .card-content {
    min-height: 150px;
  }

  .long-read .card-content::before {
    height: 4px;
    background: var(--link-color);
  }

  /* Screen reader only content */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Minor milestones */
  .milestone-banner.minor::before {
    content: none;
    animation: none;
    background: none;
    display: none;
  }

  /* Responsive adjustments */
  @media (max-width: 640px) {
    .card-content {
      padding: 16px;
      min-height: 120px;
    }
    
    .card-title {
      font-size: 1rem;
    }
    
    .reading-stats {
      font-size: 0.85rem;
    }

    .milestone-banner {
      margin: -16px -16px 12px -16px;
      font-size: 0.8rem;
    }
  }
</style>