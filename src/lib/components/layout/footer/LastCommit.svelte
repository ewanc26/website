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
    if (isLoading) return; // Prevent concurrent requests
    
    isLoading = true;
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const response: Response = await fetch('https://api.github.com/repos/ewanc26/website/commits/main', {
        signal: controller.signal,
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`GitHub API responded with ${response.status}`);
      }
      
      const data: { commit: { author: { date: string } }, html_url: string, sha: string } = await response.json();
      
      commitDate = new Date(data.commit.author.date);
      commitUrl = data.html_url;
      commitHash = data.sha.substring(0, 7);
      relativeTime = formatRelativeTime(commitDate);
      hasLoaded = true;

    } catch (error) {
      console.error('Error fetching commit info:', error);
      // Don't show error to user, just silently fail
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('GitHub API request timed out');
      }
    } finally {
      isLoading = false;
    }
  }

  // Update relative time without fetching new data
  function updateRelativeTime(): void {
    if (commitDate) {
      relativeTime = formatRelativeTime(commitDate);
    }
  }

  let fetchInterval: number;
  let timeUpdateInterval: number;

  onMount(() => {
    // Delay initial fetch to not block page load
    setTimeout(() => {
      updateLastCommit();
    }, 8000); // Wait 8 seconds after page load
    
    // Fetch updates every 10 minutes (less frequent than before)
    fetchInterval = window.setInterval(updateLastCommit, 600000) as number; // 10 minutes
    
    // Update relative time display every 30 seconds (less frequent)
    timeUpdateInterval = window.setInterval(updateRelativeTime, 30000) as number;
  });

  onDestroy(() => {
    if (fetchInterval) {
      clearInterval(fetchInterval);
    }
    if (timeUpdateInterval) {
      clearInterval(timeUpdateInterval);
    }
  });
</script>

{#if hasLoaded && commitDate}
  <span title="{commitDate.toLocaleString()}">
    last commit: <a href="{commitUrl}" target="_blank" class="text-[var(--link-color)] hover:text-[var(--link-hover-color)]">{commitHash}</a> ({relativeTime})
  </span>
{:else if isLoading}
  <span class="opacity-50">loading commit info...</span>
{/if}