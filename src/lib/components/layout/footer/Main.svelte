<script lang="ts">
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { env } from "$env/dynamic/public";
  import LastCommit from "./LastCommit.svelte";
  import TidClock from "./TidClock.svelte";
  import type { SiteInfo } from "$components/shared";

  export let profile: any;
  export let siteInfo: SiteInfo | null = null;
  export const posts: any = undefined;

  let copyrightText = "";

  // Calculate copyright text (works on both server and client)
  function calculateCopyrightText(): string {
    const currentYear = new Date().getFullYear();
    
    // Get birth year from siteInfo with fallbacks and validation
    let birthYear: number | null = null;
    
    if (siteInfo?.additionalInfo?.websiteBirthYear) {
      const year = siteInfo.additionalInfo.websiteBirthYear;
      // Validate year is reasonable (between 1990 and current year)
      if (year >= 1990 && year <= currentYear) {
        birthYear = year;
      }
    }
    
    // Fallback to current year if no valid birth year
    if (!birthYear) {
      birthYear = currentYear;
    }
    
    // Format copyright text
    if (birthYear === currentYear) {
      return currentYear.toString();
    } else {
      return `${birthYear} - ${currentYear}`;
    }
  }

  // Update copyright text and DOM element (browser only)
  function updateCopyrightText() {
    copyrightText = calculateCopyrightText();
    
    // Only update DOM if we're in the browser
    if (browser) {
      const copyrightYearElement = document.getElementById("copyright-year");
      if (copyrightYearElement) {
        copyrightYearElement.textContent = copyrightText;
      }
    }
  }

  // Initialize copyright text immediately (for SSR)
  copyrightText = calculateCopyrightText();

  onMount(() => {
    updateCopyrightText();
  });

  // Reactive statement to update when siteInfo changes
  $: if (siteInfo !== undefined) {
    updateCopyrightText();
  }
</script>

<footer class="text-center py-4 text-primary text-sm opacity-60">
  <div class="flex flex-col justify-center items-center gap-2">
    <div>
      <span>&copy; <span id="copyright-year">{copyrightText}</span></span>

      <span class="mx-1"></span>

      {#if profile?.handle}
        <a
          href="https://bsky.app/profile/{profile.did}"
          class="text-[var(--link-color)] hover:text-[var(--link-hover-color)]"
        >
          @{profile.handle}
        </a>
      {:else}
        <span>{profile?.displayName || profile?.did}</span>
      {/if}

      {#if env.PUBLIC_ACTIVITYPUB_USER && env.PUBLIC_ACTIVITYPUB_USER.length > 0 && profile?.handle}
        <span class="mx-1"></span>
      {/if}

      {#if env.PUBLIC_ACTIVITYPUB_USER && env.PUBLIC_ACTIVITYPUB_USER.length > 0}
        <a
          rel="me"
          href={`https://${env.PUBLIC_ACTIVITYPUB_USER.split("@")[2]}/@${env.PUBLIC_ACTIVITYPUB_USER.split("@")[1]}`}
          class="text-[var(--link-color)] hover:text-[var(--link-hover-color)]"
        >
          @{env.PUBLIC_ACTIVITYPUB_USER.split(
            "@",
          )[1]}@{env.PUBLIC_ACTIVITYPUB_USER.split("@")[2]}
        </a>
      {/if}
    </div>

    <div>
      <span
        >powered by <a
          class="text-[var(--link-color)] hover:text-[var(--link-hover-color)]"
          href="https://atproto.com/guides/glossary#at-protocol">atproto</a
        ></span
      >

      <span class="mx-1"></span>
      <a
        class="text-[var(--link-color)] hover:text-[var(--link-hover-color)]"
        href="/site/meta"
      >
        about site & privacy
      </a>
    </div>

    <div>
      <span class="mx-1"></span>
      <LastCommit />

      <span class="mx-1"></span>
      <a
        class="text-[var(--link-color)] hover:text-[var(--link-hover-color)]"
        href="https://github.com/ewanc26/website"
        target="_blank"
        rel="noopener noreferrer"
      >
      code
      </a>     

      <span class="mx-1"></span>
      <TidClock />
    </div>
  </div>
</footer>