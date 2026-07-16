<script lang="ts">
  /**
   * LoadingSkeleton — shimmer placeholder for async content.
   * Renders `count` animated skeleton bars that appear while
   * data is being fetched. Matches the site's surface color
   * tokens so the transition to real content is seamless.
   */
  interface Props {
    count?: number;
    label?: string;
  }
  let { count = 1, label = "Loading content" }: Props = $props();
</script>

<div class="loading-skeleton-group" role="status" aria-label={label}>
  {#each Array(count) as _}
    <div class="loading-skeleton" aria-hidden="true">
      <div class="skeleton-pulse"></div>
    </div>
  {/each}
</div>

<style>
  .loading-skeleton-group {
    width: 100%;
  }

  .loading-skeleton {
    width: 100%;
    height: 1.5rem;
    border-radius: var(--radius-sm);
    background-color: var(--surface-color);
    overflow: hidden;
    margin: var(--space-xs) 0;
  }

  .skeleton-pulse {
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      var(--surface-color) 0%,
      var(--surface-raised) 50%,
      var(--surface-color) 100%
    );
    background-size: 200% 100%;
    animation: pulse 1.5s infinite linear;
  }

  @keyframes pulse {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .skeleton-pulse {
      animation: none;
    }
  }
</style>
