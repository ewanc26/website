<script lang="ts">
  import { onMount } from "svelte";

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
      <a class="hover:text-[var(--link-hover-color)]" href="/info"
        >More about this site</a
      >
    </div>
  </div>
  {#if import.meta.env.PUBLIC_ACTIVITYPUB_USER}
    <a rel="me" href={`https://${import.meta.env.PUBLIC_ACTIVITYPUB_USER.split('@')[2]}/@${import.meta.env.PUBLIC_ACTIVITYPUB_USER.split('@')[1]}`} aria-label="Mastodon link."></a>
  {/if}
</footer>