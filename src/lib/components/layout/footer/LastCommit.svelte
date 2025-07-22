<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { formatRelativeTime } from '$utils/dateFormatter';

  let commitDate: Date | null = null;
  let commitUrl: string = '';
  let commitHash: string = '';
  let relativeTime: string = '';

  async function updateLastCommit(): Promise<void> {
    try {
      const response: Response = await fetch('https://api.github.com/repos/ewanc26/website/commits/main');
      const data: { commit: { author: { date: string } }, html_url: string, sha: string } = await response.json();
      
      commitDate = new Date(data.commit.author.date);
      commitUrl = data.html_url;
      commitHash = data.sha.substring(0, 7);
      relativeTime = formatRelativeTime(commitDate);

    } catch (error) {
      console.error('Error fetching commit info:', error);
    }
  }

  let intervalId: number;

  onMount(() => {
    updateLastCommit();
    intervalId = window.setInterval(updateLastCommit, 300000) as number;
  });

  onDestroy(() => {
    clearInterval(intervalId);
  });
</script>

{#if commitDate}
  <span title="{commitDate.toLocaleString()}">
  last commit: <a href="{commitUrl}" target="_blank" class="text-[var(--link-color)] hover:text-[var(--link-hover-color)]">{commitHash}</a> ({relativeTime})
  </span>
{/if}