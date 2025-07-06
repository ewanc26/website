<script lang="ts">
  import { browser } from "$app/environment";
  import { safeFetch } from "./profile";
  import { formatRelativeTime } from "$lib/utils/dateFormatter";
  import { fade } from "svelte/transition";

  /**
   * The profile object is passed as a prop to this component.
   * It should contain at least 'pds', 'did', 'handle', and 'displayName' fields.
   */
  export let profile: any;

  // Reactive Svelte stores for the latest "now" status text and any error state.
  let latestNowText: string | null = null;
  let latestNowDate: Date | null = null; // Store the date of the latest 'now' status
  let errorState: string | null = null;

  /**
   * Fetches the latest record from the 'uk.ewancroft.now' lexicon for the current profile.
   * This function is called on component mount and reactively when the profile prop changes.
   */
  async function fetchLatestNow(): Promise<void> {
    if (!profile || !profile.pds || !profile.did) {
      latestNowText = null;
      return;
    }
    try {
      const pdsUrl = profile.pds;
      // Add timestamp parameter to prevent caching
      const timestamp = Date.now();
      const listRecordsUrl = `${pdsUrl}/xrpc/com.atproto.repo.listRecords?repo=${profile.did}&collection=uk.ewancroft.now&_=${timestamp}`;
      const data = await safeFetch(listRecordsUrl, window.fetch);
      if (data && data.records && data.records.length > 0) {
        const sortedRecords = data.records.sort((a: any, b: any) => {
          const dateA = new Date(a.value.createdAt).getTime();
          const dateB = new Date(b.value.createdAt).getTime();
          return dateB - dateA;
        });
        // Sanitise text by removing HTML tags and preventing caching
      latestNowText = sortedRecords[0].value.text
        .replace(/<[^>]*>?/gm, '')
        .trim();
        latestNowDate = new Date(sortedRecords[0].value.createdAt);
        errorState = null;
      } else {
        latestNowText = null;
        latestNowDate = null;
      }
    } catch (err) {
      errorState =
        err instanceof Error ? err.message : "Failed to load current status.";
      latestNowText = null;
      latestNowDate = null;
    }
  }

  // Reactively fetch status when profile changes (client-side only)
  $: if (browser && profile) {
    fetchLatestNow();
  }
</script>

<!--
  Displays the latest "now" status in the format: (handle) / (displayName) is (status) (relative timestamp)
  Expects a 'profile' prop with 'pds', 'did', 'handle', and 'displayName'.
-->
{#if latestNowText && profile}
  <div class="p-2">
    <p class="text-center text-xs">
      {#key latestNowText}
        <span transition:fade={{ duration: 200 }}>
          <span class="font-medium">{profile.displayName || profile.handle || profile.did}</span>
          <span> is </span>
          <span class="italic">{latestNowText}</span>
        </span>
      {/key}
    </p>
    {#if latestNowDate}
      <p class="text-center text-xs opacity-50 mt-0.5">
        {#key latestNowDate}
          <span transition:fade={{ duration: 200 }}>{formatRelativeTime(latestNowDate)}</span>
        {/key}
      </p>
    {/if}
  </div>
{/if}