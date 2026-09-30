<script lang="ts">
  import "../styles/riso.css";
  import { page } from "$app/state";
  import { ME_LINKS } from "$lib/config";
  import { pulseAmbiance } from "$lib/stores/ambiance";
  import { extraBacklinkTargets } from "$lib/stores/backlinkTargets";
  import Header from "$lib/components/Header.svelte";
  import Colophon from "$lib/components/Colophon.svelte";
  import BacklinkAvatars from "$lib/components/BacklinkAvatars.svelte";
  import SeasonalThemeUpdater from "$lib/components/SeasonalThemeUpdater.svelte";
  import AmbianceEngine from "$lib/components/AmbianceEngine.svelte";
  import WolfPawTrail from "$lib/components/WolfPawTrail.svelte";
  import MondayEgg from "$lib/components/ostara-eggs/MondayEgg.svelte";
  import IdleEgg from "$lib/components/ostara-eggs/IdleEgg.svelte";
  import ThreeToast from "$lib/components/ostara-eggs/ThreeToast.svelte";
  import BlogArchiveEggs from "$lib/components/ostara-eggs/BlogArchiveEggs.svelte";
  import HeritageEggs from "$lib/components/ostara-eggs/HeritageEggs.svelte";

  let { data, children } = $props();

  const backlinks = $derived([`https://ewancroft.uk${page.url.pathname}`, ...$extraBacklinkTargets]);

  function handleClick(event: MouseEvent) {
    const el = (event.target as HTMLElement).closest<HTMLElement>("[data-copy]");
    if (!el) return;
    const label = el.dataset.label ?? el.textContent ?? "";
    el.dataset.label = label;
    navigator.clipboard
      ?.writeText(el.dataset.copy ?? "")
      .then(() => {
        el.textContent = "Copied";
        pulseAmbiance();
        setTimeout(() => (el.textContent = label), 2000);
      })
      .catch(() => {});
  }
</script>

<svelte:head>
  {@html `<style id="sabbat-dynamic-theme">${data.dynamicThemeCss}</style>`}
  <link rel="alternate" type="application/rss+xml" title="Ewan's Corner" href="/rss.xml" />
  <meta name="theme-color" content="#f1f3f3" media="(prefers-color-scheme: light)" />
  <meta name="theme-color" content="#0d0d14" media="(prefers-color-scheme: dark)" />
  {#each ME_LINKS as href (href)}
    <link rel="me" {href} />
  {/each}
</svelte:head>

<svelte:body onclick={handleClick} />

<!--
  Persistent widgets: no transition:persist equivalent is needed here —
  SvelteKit's root layout instance doesn't remount across client-side
  navigation, so these mount once per session, same end result as Astro's
  transition:persist achieved with an extra mechanism.
-->
<SeasonalThemeUpdater />
<AmbianceEngine />
<WolfPawTrail />
<MondayEgg />
<IdleEgg />
<ThreeToast />
<BlogArchiveEggs />
<HeritageEggs />

<!-- Shared SVG filters, kept for .text-outline consumers. -->
<svg class="svg-defs" aria-hidden="true" focusable="false">
  <filter id="text-outline" x="-20%" y="-60%" width="140%" height="220%" color-interpolation-filters="sRGB">
    <feMorphology in="SourceGraphic" operator="dilate" radius="1.1" result="thick" />
    <feComposite in="thick" in2="SourceGraphic" operator="out" />
  </filter>
</svg>

<a class="skip-to-content" href="#main-content">Skip to content</a>
<Header almanac={data.almanac} />
<div class="shell-main" id="main-content" tabindex="-1">
  {@render children?.()}
</div>
{#if page.status !== 404}
  <div class="wrap backlinks"><BacklinkAvatars targets={backlinks} /></div>
{/if}
<Colophon almanac={data.almanac} siteInfo={data.siteInfo} />
