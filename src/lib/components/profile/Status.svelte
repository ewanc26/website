<script lang="ts">
  import { browser } from "$app/environment";
  import { onMount } from 'svelte';
  import { env } from '$env/dynamic/public';
  import { safeFetch } from "./profile";
  import { formatRelativeTime } from "$lib/utils/dateFormatter";
  import { fade } from "svelte/transition";

  /**
   * The profile object is passed as a prop to this component.
   * It should contain at least 'pds', 'did', 'handle', and 'displayName' fields.
   */
  export let profile: any;

  // Status-related state
  let latestNowText: string | null = null;
  let latestNowDate: Date | null = null;
  let statusError: string | null = null;

  // RecentFM-related state
  let musicLoading = false;
  let musicError: string | null = null;
  let trackData: {
    name: string;
    artist: string;
    url: string;
  } | null = null;

  // Consolidated display state
  let displayMode: 'status' | 'music' | 'none' = 'none';
  let showContent = false; // New state variable to control visibility

  /**
   * Fetches the latest record from the 'uk.ewancroft.now' lexicon for the current profile.
   */
  async function fetchLatestNow(): Promise<void> {
    console.log('[Status] Starting to fetch status data...');
    
    if (!profile || !profile.pds || !profile.did) {
      console.log('[Status] No profile data available:', { profile: !!profile, pds: profile?.pds, did: profile?.did });
      latestNowText = null;
      return;
    }
    
    try {
      const pdsUrl = profile.pds;
      const timestamp = Date.now();
      const listRecordsUrl = `${pdsUrl}/xrpc/com.atproto.repo.listRecords?repo=${profile.did}&collection=uk.ewancroft.now&_=${timestamp}`;
      
      console.log('[Status] Fetching from URL:', listRecordsUrl);
      
      const data = await safeFetch(listRecordsUrl, window.fetch);
      console.log('[Status] Raw response data:', data);
      
      if (data && data.records && data.records.length > 0) {
        console.log('[Status] Found', data.records.length, 'status records');
        
        const sortedRecords = data.records.sort((a: any, b: any) => {
          const dateA = new Date(a.value.createdAt).getTime();
          const dateB = new Date(b.value.createdAt).getTime();
          return dateB - dateA;
        });
        
        console.log('[Status] Latest record:', sortedRecords[0]);
        
        latestNowText = sortedRecords[0].value.text
          .replace(/<[^>]*>?/gm, '')
          .trim();
        latestNowDate = new Date(sortedRecords[0].value.createdAt);
        statusError = null;
        
        console.log('[Status] Processed status:', { text: latestNowText, date: latestNowDate });
      } else {
        console.log('[Status] No status records found');
        latestNowText = null;
        latestNowDate = null;
      }
    } catch (err) {
      console.error('[Status] Error fetching status:', err);
      statusError = err instanceof Error ? err.message : "Failed to load current status.";
      latestNowText = null;
      latestNowDate = null;
    }
  }

  /**
   * Fetches recent music from Last.fm via RecentFM API
   */
  async function fetchRecentMusic(): Promise<void> {
    console.log('[RecentFM] Starting to fetch music data...');
    
    const lastfmUsername = env.PUBLIC_LASTFM_USERNAME;
    console.log('[RecentFM] Last.fm username:', lastfmUsername);
    
    if (!lastfmUsername) {
      console.log('[RecentFM] No Last.fm username configured, skipping music fetch');
      return;
    }
    
    musicLoading = true;
    console.log('[RecentFM] Setting loading state to true');
    
    try {
      const params = new URLSearchParams({
        username: lastfmUsername,
        emoji: '🎧',
        nomoji: 'false'
      });
      
      const url = `https://recentfm.rknight.me/now.php?${params.toString()}`;
      console.log('[RecentFM] Fetching from URL:', url);
      
      const response = await fetch(url);
      console.log('[RecentFM] Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[RecentFM] Raw response data:', data);
      
      if (data.content) {
        console.log('[RecentFM] Processing HTML content...');
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.content, 'text/html');
        const link = doc.querySelector('a');
        
        if (link) {
          const fullText = link.textContent || '';
          const url = link.href;
          console.log('[RecentFM] Found link:', { text: fullText, url });
          
          const match = fullText.match(/^(.+?) by (.+)$/);
          if (match) {
            trackData = {
              name: match[1].trim(),
              artist: match[2].trim(),
              url: url
            };
            console.log('[RecentFM] Parsed track data:', trackData);
          } else {
            console.log('[RecentFM] Could not parse track info from text:', fullText);
          }
        } else {
          console.log('[RecentFM] No link found in HTML content');
        }
      } else {
        console.log('[RecentFM] No content found in response');
      }
      
    } catch (err) {
      console.error('[RecentFM] Error fetching RecentFM data:', err);
      musicError = 'Failed to load recent tracks';
    } finally {
      musicLoading = false;
      console.log('[RecentFM] Setting loading state to false');
    }
  }

  /**
   * Determines what to display based on available data and recency
   */
  function updateDisplayMode(): void {
    console.log('[Display] Updating display mode...');
    console.log('[Display] Current data state:', {
      hasStatus: !!latestNowText,
      hasMusic: !!trackData,
      statusDate: latestNowDate,
      statusText: latestNowText,
      trackData: trackData
    });
    
    // If we have both status and music data, prioritize based on recency
    if (latestNowText && trackData && latestNowDate) {
      const statusAge = Date.now() - latestNowDate.getTime();
      const maxStatusAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      const statusAgeHours = statusAge / (60 * 60 * 1000);
      
      console.log('[Display] Status age:', statusAgeHours.toFixed(2), 'hours');
      console.log('[Display] Max status age: 24 hours');
      
      // Show status if it's recent (within 24 hours), otherwise show music
      displayMode = statusAge < maxStatusAge ? 'status' : 'music';
      console.log('[Display] Both available, chose:', displayMode, '(status is', statusAge < maxStatusAge ? 'recent' : 'old', ')');
    }
    // If we only have status, show it
    else if (latestNowText) {
      displayMode = 'status';
      console.log('[Display] Only status available, displaying status');
    }
    // If we only have music, show it
    else if (trackData) {
      displayMode = 'music';
      console.log('[Display] Only music available, displaying music');
    }
    // If we have neither, show nothing
    else {
      displayMode = 'none';
      console.log('[Display] No data available, displaying nothing');
    }
    
    console.log('[Display] Final display mode:', displayMode);
  }

  // Load data on mount
  onMount(async () => {
    console.log('[Component] Component mounted, starting data fetch...');
    console.log('[Component] Profile:', profile);
    
    await Promise.all([
      fetchLatestNow(),
      fetchRecentMusic()
    ]);
    
    console.log('[Component] All data fetched, updating display mode...');
    updateDisplayMode();

    // Introduce a delay before showing content
    setTimeout(() => {
      showContent = true;
    }, 5000); // 5 seconds delay
  });

  // Reactively fetch status when profile changes (client-side only)
  $: if (browser && profile) {
    console.log('[Component] Profile changed, refetching status...');
    fetchLatestNow().then(() => {
      console.log('[Component] Status refetch complete, updating display...');
      updateDisplayMode();
    });
  }

  // Update display mode when data changes
  $: if (latestNowText !== undefined || trackData !== undefined) {
    console.log('[Component] Data changed, updating display mode...');
    updateDisplayMode();
  }
</script>

<!--
  Consolidated display of either status or recent music, prioritizing recent status updates
-->
{#if displayMode !== 'none' && profile && showContent}
  <div class="p-2">
    {#if displayMode === 'status' && latestNowText}
      <!-- Status Display -->
      <p class="text-center text-xs">
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
              <a 
                href={trackData.url} 
                class="text-link hover:text-link-hover"
                target="_blank"
                rel="noopener noreferrer"
              >
                "{trackData.name}" by {trackData.artist}
              </a>
            {/if}
          </span>
        {/key}
      </p>
    {:else if displayMode === 'music' && trackData}
      <!-- Music Display -->
      <div class="recent-track-info">
        <p class="text-xs opacity-60 text-center">
          {profile.displayName || profile.handle || profile.did} was last listening to
        </p>
        <p class="text-xs font-medium text-center mt-0.5">
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
    
    {#if musicLoading}
      <p class="text-xs opacity-60 italic text-center">Loading recent tracks...</p>
    {/if}
  </div>
{/if}