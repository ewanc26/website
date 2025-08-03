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

<footer class="text-center py-4 text-primary text-sm opacity-60">
  <div class="flex flex-col justify-center items-center gap-2">
    <div>
      <span>&copy; <span id="copyright-year"></span></span>

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
        about this site & privacy policy
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
