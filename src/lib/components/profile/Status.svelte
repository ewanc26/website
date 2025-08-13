<script lang="ts">
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import { env } from "$env/dynamic/public";
  import { safeFetch } from "./profile";
  import { formatRelativeTime } from "$utils/formatters";
  import { fade } from "svelte/transition";
  import { getCache, setCache } from "$utils/cache";

  // Props
  export let profile: {
    pds?: string;
    did?: string;
    handle?: string;
    displayName?: string;
  } | null = null;

  // State
  let latestNowText: string | null = null;
  let latestNowDate: Date | null = null;
  let latestNowExpiry: number | null = null;
  let statusError: string | null = null;

  let musicLoading = false;
  let musicError: string | null = null;
  let trackData: { name: string; artist: string; url: string } | null = null;

  let showContent = false;
  let contentLoaded = false;

  // Derived: auto-decides what to show based on state
  $: displayMode = (() => {
    const now = Date.now();
    const statusFresh = latestNowText && latestNowDate && latestNowExpiry && now < latestNowExpiry;

    if (statusFresh) return "status";
    if (trackData) return "music";
    return "none";
  })();

  async function fetchLatestNow() {
    if (!profile?.pds || !profile?.did) {
      latestNowText = null;
      latestNowDate = null;
      latestNowExpiry = null;
      return;
    }

    const cacheKey = `status_${profile.did}`;
    const cached = getCache<{ text: string; date: string }>(cacheKey);
    if (cached) {
      latestNowText = cached.text;
      latestNowDate = new Date(cached.date);
      latestNowExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
      return;
    }

    try {
      const pdsUrl = profile.pds;
      const timestamp = Date.now();
      const listRecordsUrl = `${pdsUrl}/xrpc/com.atproto.repo.listRecords?repo=${profile.did}&collection=uk.ewancroft.now&_=${timestamp}`;
      const data = await safeFetch(listRecordsUrl, window.fetch);

      if (data?.records?.length > 0) {
        const sorted = data.records.sort(
          (a: any, b: any) =>
            new Date(b.value.createdAt).getTime() -
            new Date(a.value.createdAt).getTime()
        );
        const latest = sorted[0].value;
        latestNowText = latest.text.replace(/<[^>]*>?/gm, "").trim();
        latestNowDate = new Date(latest.createdAt);
        latestNowExpiry = Date.now() + 5 * 60 * 1000; // 5 min TTL

        setCache(cacheKey, { text: latestNowText, date: latestNowDate.toISOString() }, 5 * 60 * 1000);
        statusError = null;
      } else {
        latestNowText = null;
        latestNowDate = null;
        latestNowExpiry = null;
      }
    } catch (err) {
      console.error("[Status] Error fetching status:", err);
      statusError = err instanceof Error ? err.message : "Failed to load current status.";
      latestNowText = null;
      latestNowDate = null;
      latestNowExpiry = null;
    }
  }

  async function fetchRecentMusic() {
    const lastfmUsername = env.PUBLIC_LASTFM_USERNAME;
    if (!lastfmUsername) return;

    musicLoading = true;
    try {
      const params = new URLSearchParams({
        username: lastfmUsername,
        emoji: "🎧",
        nomoji: "false"
      });
      const url = `https://recentfm.rknight.me/now.php?${params.toString()}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (data.content) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.content, "text/html");
        const link = doc.querySelector("a");
        if (link) {
          const fullText = link.textContent || "";
          const match = fullText.match(/^(.+?) by (.+)$/);
          if (match) {
            trackData = {
              name: match[1].trim(),
              artist: match[2].trim(),
              url: link.href
            };
          }
        }
      }
    } catch (err) {
      console.error("[RecentFM] Error fetching RecentFM data:", err);
      musicError = "Failed to load recent tracks";
    } finally {
      musicLoading = false;
    }
  }

  async function loadContentStaggered() {
    if (contentLoaded || !browser || !profile) return;
    contentLoaded = true;

    try {
      await fetchLatestNow();
      setTimeout(() => (showContent = true), 300);
      await new Promise((r) => setTimeout(r, 2000));
      await fetchRecentMusic();
    } catch (err) {
      console.error("[Status] Error in staggered loading:", err);
      setTimeout(() => (showContent = true), 300);
    }
  }

  onMount(() => {
    setTimeout(() => {
      loadContentStaggered();
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
      {#if musicLoading}
        <p class="text-xs opacity-60 italic text-center sm:text-left">
          Loading recent tracks...
        </p>
      {/if}
    </div>
  </div>
{/if}
