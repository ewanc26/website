<script lang="ts">
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import { formatRelativeTime } from "$utils/formatters";
  import { fade } from "svelte/transition";

  export let profile: {
    pds?: string;
    did?: string;
    handle?: string;
    displayName?: string;
  } | null = null;

  let latestNowText: string | null = null;
  let latestNowDate: Date | null = null;
  let latestNowExpiry: number | null = null;
  let trackData: { name: string; artist: string; url: string } | null = null;
  let showContent = false;
  let contentLoaded = false;

  $: displayMode = (() => {
    const now = Date.now();
    const statusFresh = latestNowText && latestNowDate && latestNowExpiry && now < latestNowExpiry;

    if (statusFresh) return "status";
    if (trackData) return "music";
    return "none";
  })();

  async function loadStatusAndMusic() {
    if (!profile?.pds || !profile?.did) return;
    
    try {
      const params = new URLSearchParams({
        did: profile.did,
        pds: profile.pds
      });
      
      const response = await fetch(`/api/status?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch status');
      
      const data = await response.json();
      
      if (data.status) {
        latestNowText = data.status.text;
        latestNowDate = new Date(data.status.date);
        latestNowExpiry = Date.now() + 5 * 60 * 1000;
      }
      
      if (data.music) {
        trackData = data.music;
      }
      
      setTimeout(() => (showContent = true), 300);
    } catch (error) {
      console.error('Error fetching status/music:', error);
      setTimeout(() => (showContent = true), 300);
    }
  }

  onMount(() => {
    if (contentLoaded || !browser || !profile) return;
    contentLoaded = true;
    
    setTimeout(() => {
      loadStatusAndMusic();
    }, 1500);
  });
</script>

{#if displayMode !== "none" && profile && showContent}
  <div transition:fade={{ duration: 500 }}>
    <div class="py-2">
      {#if displayMode === "status" && latestNowText}
        <p class="text-center sm:text-left text-xs">
          {#key latestNowText}
            <span transition:fade={{ duration: 200 }}>
              <span class="font-medium">{profile.displayName || profile.handle || profile.did}</span>
              <span> is </span>
              <span class="italic">{latestNowText}</span>
              {#if latestNowDate}
                <span class="opacity-50"> ({formatRelativeTime(latestNowDate)})</span>
              {/if}
              {#if trackData}
                <span> and was last listening to </span>
                <a href={trackData.url} class="text-link hover:text-link-hover" target="_blank" rel="noopener noreferrer">
                  "{trackData.name}" by {trackData.artist}
                </a>
              {/if}
            </span>
          {/key}
        </p>
      {:else if displayMode === "music" && trackData}
        <div class="recent-track-info">
          <p class="text-xs opacity-60 text-center sm:text-left">
            {profile.displayName || profile.handle || profile.did} was last listening to
            <a href={trackData.url} class="text-link hover:text-link-hover" target="_blank" rel="noopener noreferrer">
              "{trackData.name}" by {trackData.artist}
            </a>
          </p>
        </div>
      {/if}
    </div>
  </div>
{/if}
