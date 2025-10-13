<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchStatus, type StatusData } from '$lib/services/atproto';
  
  let status = $state<StatusData | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);

  onMount(async () => {
    try {
      status = await fetchStatus();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load status';
    } finally {
      loading = false;
    }
  });

  function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
</script>

<div class="w-full max-w-2xl mx-auto">
  {#if loading}
    <div class="animate-pulse bg-background-50 dark:bg-background-900 rounded-xl shadow-md p-4">
      <div class="flex items-center gap-2 mb-2">
        <div class="w-2 h-2 rounded-full bg-background-200 dark:bg-background-800"></div>
        <div class="h-3 bg-background-200 dark:bg-background-800 rounded w-16"></div>
      </div>
      <div class="h-5 bg-background-200 dark:bg-background-800 rounded w-3/4"></div>
    </div>
  {:else if error}
    <!-- Silently fail - status is optional -->
  {:else if status}
    <div class="bg-background-50 dark:bg-background-900 rounded-xl shadow-md p-4 border border-accent-200 dark:border-accent-800 transition-all duration-300 hover:shadow-lg">
      <div class="flex items-center gap-2 mb-2">
        <div class="w-2 h-2 rounded-full bg-accent-500 animate-pulse"></div>
        <span class="text-xs font-medium text-text-600 dark:text-text-400 uppercase tracking-wide">
          Current Status
        </span>
      </div>
      
      <p class="text-lg font-medium text-text-900 dark:text-text-50 mb-2">
        {status.text}
      </p>
      
      <time
        datetime={status.createdAt}
        class="text-xs text-text-500 dark:text-text-500"
      >
        {formatRelativeTime(status.createdAt)}
      </time>
    </div>
  {/if}
</div>