<script lang="ts">
  import { onMount } from 'svelte';
  import { PUBLIC_LASTFM_USERNAME } from '$env/static/public';
  
  interface Props {
    nomoji?: boolean;
    displayName?: string;
  }
  
  let { nomoji = true, displayName = 'User' }: Props = $props();
  
  let loading = $state(false);
  let error = $state<string | null>(null);
  let trackData = $state<{
    name: string;
    artist: string;
    url: string;
  } | null>(null);
  
  onMount(async () => {
    // Don't load if no username is configured
    if (!PUBLIC_LASTFM_USERNAME) {
      return;
    }
    
    loading = true;
    
    try {
      const params = new URLSearchParams({
        username: PUBLIC_LASTFM_USERNAME,
        emoji: '🎧',
        nomoji: 'false'
      });
      
      const response = await fetch(`https://recentfm.rknight.me/now.php?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Parse the HTML content to extract track info
      if (data.content) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.content, 'text/html');
        const link = doc.querySelector('a');
        
        if (link) {
          const fullText = link.textContent || '';
          const url = link.href;
          
          // Extract track name and artist from "Track Name by Artist Name"
          const match = fullText.match(/^(.+?) by (.+)$/);
          if (match) {
            trackData = {
              name: match[1].trim(),
              artist: match[2].trim(),
              url: url
            };
          }
        }
      }
      
    } catch (err) {
      console.error('Error fetching RecentFM data:', err);
      error = 'Failed to load recent tracks';
    } finally {
      loading = false;
    }
  });
</script>

{#if PUBLIC_LASTFM_USERNAME && !error}
  <div class="recent-played mt-1">
    {#if loading}
      <div class="recentfm-loading">
        <p class="text-xs opacity-60 italic">Loading recent tracks...</p>
      </div>
    {:else if trackData}
      <div class="recent-track-info">
        <p class="text-xs opacity-60">
          {#if !nomoji}🎧 {/if}{displayName} was last listening to
        </p>
        <p class="text-xs font-medium">
          <a 
            href={trackData.url} 
            class="text-link hover:text-link-hover"
            target="_blank"
            rel="noopener noreferrer"
          >
            "{trackData.name}" by {trackData.artist}
          </a>
        </p>
      </div>
    {/if}
  </div>
{/if}