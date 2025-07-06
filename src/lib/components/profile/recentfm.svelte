<script lang="ts">
  import { onMount } from 'svelte';
  import { PUBLIC_LASTFM_USERNAME } from '$env/static/public';
  
  interface Props {
    nomoji?: boolean;
  }
  
  let { nomoji = true }: Props = $props();
  
  let loading = $state(false);
  let error = $state<string | null>(null);
  let content = $state<string>('');
  
  onMount(async () => {
    // Don't load if no username is configured
    if (!PUBLIC_LASTFM_USERNAME) {
      return;
    }
    
    loading = true;
    
    try {
      const emoji = nomoji ? '' : '🎧';
      const params = new URLSearchParams({
        username: PUBLIC_LASTFM_USERNAME,
        emoji: emoji,
        nomoji: nomoji.toString()
      });
      
      const response = await fetch(`https://recentfm.rknight.me/now.php?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      content = data.content || '';
      
    } catch (err) {
      console.error('Error fetching RecentFM data:', err);
      error = 'Failed to load recent tracks';
    } finally {
      loading = false;
    }
  });
</script>

{#if PUBLIC_LASTFM_USERNAME && !error}
  <div class="recent-played">
    {#if loading}
      <div class="recentfm-loading">
        <p>Loading recent tracks...</p>
      </div>
    {:else if content}
      {@html content}
    {/if}
  </div>
{/if}

<style>
  .recent-played {
    @apply text-center text-sm;
  }
</style>