<script lang="ts">
  import { fly, fade } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { formatDate } from "$lib/utils/dateFormatter";

  export let type: 'post' | 'link';
  export let post: any = {}; // For post type
  export let title: string = ""; // For link type or post title
  export let url: string = ""; // For link type
  export let value: string = ""; // For link type
  export let monthIndex: number = 0;
  export let postIndex: number = 0;
  export let localeLoaded: boolean = false;

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
      <!-- Header section with title and type indicator -->
      <header class="card-header">
        {#if type === 'post'}
          <div class="type-indicator post-indicator">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <line x1="10" y1="9" x2="8" y2="9"/>
            </svg>
            <span class="sr-only">Blog post</span>
          </div>
        {:else}
          <div class="type-indicator link-indicator">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
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
              <span class="stat-number">{post.wordCount?.toLocaleString() || '0'}</span>
              <span class="stat-label">words</span>
            </div>
            <div class="stat-divider">•</div>
            <div class="stat-item time" class:highlight={isLongRead}>
              <div class="reading-time-icon" class:quick={isQuickRead} class:medium={isMediumRead} class:long={isLongRead}>
                {#if getReadingTimeIcon(readingTime) === 'quick'}
                  <!-- Coffee cup for quick reads (≤2 min) -->
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 8h1a4 4 0 0 1 4 4v0a4 4 0 0 1-4 4h-1"/>
                    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8Z"/>
                    <line x1="6" y1="2" x2="6" y2="4"/>
                    <line x1="10" y1="2" x2="10" y2="4"/>
                    <line x1="14" y1="2" x2="14" y2="4"/>
                  </svg>
                {:else if getReadingTimeIcon(readingTime) === 'short'}
                  <!-- Clock for short reads (3-5 min) -->
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                {:else if getReadingTimeIcon(readingTime) === 'medium'}
                  <!-- Single book for medium reads (6-10 min) -->
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                {:else}
                  <!-- Stack of books for long reads (>10 min) -->
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
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

  .post-indicator {
    background: rgba(var(--link-color-rgb, 59, 130, 246), 0.1);
    color: var(--link-color);
  }

  .link-indicator {
    background: rgba(var(--text-color-rgb, 156, 163, 175), 0.1);
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

  .reading-time-icon.quick {
    color: #10b981; /* Green for quick reads */
  }

  .reading-time-icon.medium {
    color: #f59e0b; /* Amber for medium reads */
  }

  .reading-time-icon.long {
    color: #ef4444; /* Red for long reads */
  }

  .group:hover .reading-time-icon {
    opacity: 1;
    transform: scale(1.1);
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
    background: linear-gradient(135deg, var(--header-footer-bg) 0%, rgba(var(--link-color-rgb, 59, 130, 246), 0.02) 100%);
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
  }
</style>