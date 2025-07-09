<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { PUBLIC_ATPROTOCOL_USER, PUBLIC_ACTIVITYPUB_USER } from "$env/static/public";

  export let profile: any;
  export const posts: any = undefined;

  onMount(() => {
    const copyrightYearElement = document.getElementById("copyright-year");
    if (copyrightYearElement) {
      copyrightYearElement.textContent = new Date().getFullYear().toString();
    }
  });
</script>

<footer class="text-center py-4 text-primary opacity-50 text-sm">
  <div class="space-y-1">
    <div>
      &copy; <span id="copyright-year"></span>
      {#if profile?.handle}
        <a
          href="https://bsky.app/profile/{profile.did}"
          class="hover:text-[var(--link-hover-color)]">@{profile.handle}</a
        >
      {:else}
        {profile?.displayName || profile?.did}
      {/if}
    </div>
    <div>
      powered by <a
        class="hover:text-[var(--link-hover-color)]"
        href="https://atproto.com/guides/glossary#at-protocol">atproto</a
      >
      -
      <a class="hover:text-[var(--link-hover-color)]" href="/site/meta"
        >More about this site</a
      >
    </div>
  </div>
  {#if PUBLIC_ACTIVITYPUB_USER && PUBLIC_ACTIVITYPUB_USER.length > 0}
    <a rel="me" href={`https://${PUBLIC_ACTIVITYPUB_USER.split('@')[2]}/@${PUBLIC_ACTIVITYPUB_USER.split('@')[1]}`} aria-label="Mastodon link."></a>
  {/if}
</footer>