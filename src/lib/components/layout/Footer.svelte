<script lang="ts">
  import { onMount } from "svelte";
  import { env } from "$env/dynamic/public";
  import LastCommit from "./LastCommit.svelte";
  import TidClock from "./TidClock.svelte";

  export let profile: any;
  export const posts: any = undefined;

  onMount(() => {
    const copyrightYearElement = document.getElementById("copyright-year");
    if (copyrightYearElement) {
      copyrightYearElement.textContent = new Date().getFullYear().toString();
    }
  });
</script>

<footer class="text-center py-4 text-primary text-sm">
  <div>
    &copy; <span id="copyright-year"></span>
    {#if profile?.handle}
      <a
        href="https://bsky.app/profile/{profile.did}"
        class="text-[var(--link-color)] hover:text-[var(--link-hover-color)]">@{profile.handle}</a
      >
    {:else}
      {profile?.displayName || profile?.did}
    {/if}
  </div>
  <div class="mt-1">
    powered by <a
      class="text-[var(--link-color)] hover:text-[var(--link-hover-color)]"
      href="https://atproto.com/guides/glossary#at-protocol">atproto</a
    >
    <span class="mx-1">-</span>
    <a class="text-[var(--link-color)] hover:text-[var(--link-hover-color)]" href="/site/meta"
      >More about this site</a
    >
  </div>
  <div class="mt-2">
    <LastCommit />
  </div>
  <div class="mt-2">
    <TidClock />
  </div>
  {#if env.PUBLIC_ACTIVITYPUB_USER && env.PUBLIC_ACTIVITYPUB_USER.length > 0}
    <a rel="me" href={`https://${env.PUBLIC_ACTIVITYPUB_USER.split('@')[2]}/@${env.PUBLIC_ACTIVITYPUB_USER.split('@')[1]}`} aria-label="ActivityPub actor link."></a>
  {/if}
</footer>