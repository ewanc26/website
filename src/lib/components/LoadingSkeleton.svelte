<script lang="ts">
  interface Props {
    count?: number;
  }
  let { count = 1 }: Props = $props();
</script>

{#each Array(count) as _}
  <div class="loading-skeleton">
    <div class="skeleton-pulse"></div>
  </div>
{/each}

<style>
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
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
</style>
