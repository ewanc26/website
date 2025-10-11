<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { formatRelativeTime } from '$utils/formatters';

  let commitDate: Date | null = null;
  let commitUrl: string = '';
  let commitHash: string = '';
  let relativeTime: string = '';
  let isLoading = false;
  let hasLoaded = false;

  async function updateLastCommit(): Promise<void> {
    if (isLoading) return;
    
    isLoading = true;
    try {
      const response = await fetch('/api/last-commit');
      
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      
      commitDate = new Date(data.date);
      commitUrl = data.url;
      commitHash = data.hash;
      relativeTime = formatRelativeTime(commitDate);
      hasLoaded = true;

    } catch (error) {
      console.error('Error fetching commit info:', error);
    } finally {
      isLoading = false;
    }
  }

  function updateRelativeTime(): void {
    if (commitDate) {
      relativeTime = formatRelativeTime(commitDate);
    }
  }

  let fetchInterval: number;
  let timeUpdateInterval: number;

  onMount(() => {
    setTimeout(() => {
      updateLastCommit();
    }, 2000);
    
    fetchInterval = window.setInterval(updateLastCommit, 600000);
    timeUpdateInterval = window.setInterval(updateRelativeTime, 30000);
  });

  onDestroy(() => {
    if (fetchInterval) clearInterval(fetchInterval);
    if (timeUpdateInterval) clearInterval(timeUpdateInterval);
  });
</script>

{#if hasLoaded && commitDate}
  <span title="{commitDate.toLocaleString()}">
    last commit: <a href="{commitUrl}" target="_blank" class="text-[var(--link-color)] hover:text-[var(--link-hover-color)]">{commitHash}</a> ({relativeTime})
  </span>
{:else if isLoading}
  <span class="opacity-50">loading commit info...</span>
{/if}
