<script lang="ts">
  /**
   * The spine: a solid strip down the left edge with the nav set sideways,
   * like the spine of a zine. On phones it lies down as a bar at the bottom
   * (thumb reach) — there is no hamburger. Subscriptions and Meta live in
   * the footer.
   */
  import { page } from "$app/state";
  import PixelMoon from "$lib/components/PixelMoon.svelte";
  import type { Almanac } from "$lib/utils/almanac";

  interface Props {
    almanac: Almanac;
  }
  let { almanac }: Props = $props();

  const links = [
    { label: "Home", url: "/" },
    { label: "About", url: "/about" },
    { label: "Blog", url: "/blog" },
    { label: "Projects", url: "https://docs.ewancroft.uk" },
    { label: "Support", url: "/support" },
  ];

  function isActive(url: string) {
    const pathname = page.url.pathname;
    return url === "/" ? pathname === "/" : url.startsWith("/") && pathname.startsWith(url);
  }
</script>

<nav class="spine" aria-label="Primary navigation">
  <a class="spine-logo" href="/" aria-label="Ewan Croft, home" title={`Tonight: ${almanac.moon.name.toLowerCase()}`}>
    <PixelMoon phase={almanac.moon.phase} size={39} />
  </a>
  <div class="spine-nav">
    {#each links as l (l.url)}
      <a href={l.url} aria-current={isActive(l.url) ? "page" : undefined}>{l.label}</a>
    {/each}
  </div>
  {#if import.meta.env.DEV}
    <span class="spine-dev">dev</span>
  {/if}
</nav>
