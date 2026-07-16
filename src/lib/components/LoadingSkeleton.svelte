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
    animation: skeleton-enter var(--duration-fast) var(--ease-out-quart) both;
  }

  .loading-skeleton {
    width: 100%;
    height: 1.5rem;
    border-radius: var(--radius-sm);
    background-color: var(--surface-color);
    overflow: hidden;
    margin: var(--space-xs) 0;
  }

  .loading-skeleton:nth-child(3n + 2) {
    width: 91%;
  }

  .loading-skeleton:nth-child(3n) {
    width: 76%;
  }

  .skeleton-pulse {
    width: 60%;
    height: 100%;
    background: linear-gradient(
      90deg,
      var(--surface-color) 0%,
      var(--surface-raised) 50%,
      var(--surface-color) 100%
    );
    animation: skeleton-sweep 1.6s infinite var(--ease-out-quart);
    will-change: transform;
  }

  @keyframes skeleton-enter {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes skeleton-sweep {
    from {
      transform: translateX(-120%);
    }
    to {
      transform: translateX(280%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .skeleton-pulse {
      animation: none;
    }
  }
</style>
