<script lang="ts">
  import { onMount } from 'svelte';
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
        <a href="https://bsky.app/profile/{profile.did}" class="hover:underline hover:text-[var(--link-hover-color)]">@{profile.handle}</a>
      {:else}
        {profile?.displayName || profile?.did}
      {/if}
    </div>
    <div>
      powered by <a
        class="hover:underline hover:text-[var(--link-hover-color)]"
        href="https://atproto.com/guides/glossary#at-protocol">atproto</a
      >
      • codebase on
      <a
        class="hover:underline hover:text-[var(--link-hover-color)]"
        href="https://github.com/ewanc26/website">GitHub</a
      >
      and
      <a
        class="hover:underline hover:text-[var(--link-hover-color)]"
        href="https://tangled.sh/did:plc:ofrbh253gwicbkc5nktqepol/website">Tangled</a
      >
    </div>
    <div>
      <a
        class="hover:underline hover:text-[var(--link-hover-color)]"
        href="https://www.gnu.org/licenses/agpl-3.0.en.html"
        >GNU AGPLv3 licensed code</a
      >
      •
      <a
        class="hover:underline hover:text-[var(--link-hover-color)]"
        href="https://creativecommons.org/licenses/by/4.0/"
        >CC BY 4.0 licensed text &amp; imagery</a
      >
    </div>
  </div>
</footer>
