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

<footer class="text-center py-4 text-primary text-sm flex flex-wrap justify-center items-center gap-x-2 opacity-75">
  &copy; <span id="copyright-year"></span>
  {#if profile?.handle}
    <a
      href="https://bsky.app/profile/{profile.did}"
      class="text-[var(--link-color)] hover:text-[var(--link-hover-color)]">@{profile.handle}</a
    >
  {:else}
    {profile?.displayName || profile?.did}
  {/if}
  <span class="mx-1"></span> powered by <a
    class="text-[var(--link-color)] hover:text-[var(--link-hover-color)]"
    href="https://atproto.com/guides/glossary#at-protocol">atproto</a
  >
  <span class="mx-1"></span>
  <a class="text-[var(--link-color)] hover:text-[var(--link-hover-color)]" href="/site/meta"
    >more about this site</a
  >
  <span class="mx-1"></span>
  <LastCommit />
  <span class="mx-1"></span>
  <TidClock />
  {#if env.PUBLIC_ACTIVITYPUB_USER && env.PUBLIC_ACTIVITYPUB_USER.length > 0}
    <a rel="me" href={`https://${env.PUBLIC_ACTIVITYPUB_USER.split('@')[2]}/@${env.PUBLIC_ACTIVITYPUB_USER.split('@')[1]}`} aria-label="ActivityPub actor link."></a>
  {/if}
</footer>