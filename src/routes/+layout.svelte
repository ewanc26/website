<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import { dev } from '$app/environment';
	import { onMount } from 'svelte';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import BacklinkAvatars from '$lib/components/BacklinkAvatars.svelte';
	import SabbatBackground from '$lib/components/SabbatBackground.svelte';
	import WolfPawTrail from '$lib/components/WolfPawTrail.svelte';
	import SeasonalThemeUpdater from '$lib/components/SeasonalThemeUpdater.svelte';
	import AmbianceEngine from '$lib/components/AmbianceEngine.svelte';
	import MondayEgg from '$lib/components/ostara-eggs/MondayEgg.svelte';
	import IdleEgg from '$lib/components/ostara-eggs/IdleEgg.svelte';
	import ThreeToast from '$lib/components/ostara-eggs/ThreeToast.svelte';
	import BlogArchiveEggs from '$lib/components/ostara-eggs/BlogArchiveEggs.svelte';
	import './layout.css';

	let { data, children } = $props();

	onMount(() => {
		const handleScroll = () => {
			document.documentElement.style.setProperty('--scroll-y', `${window.scrollY}`);
		};
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	});

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		// Browser back/forward gets the mirrored motion (system.css reads
		// these as custom properties, inherited into the view-transition
		// pseudo-element tree): retreating should look and feel like the
		// reverse of advancing, not identical to it. A clicked link or
		// goto() is always "forward" — there's no equivalent backward
		// gesture for those.
		const isBack = navigation.type === 'popstate' && (navigation.delta ?? 0) < 0;
		const root = document.documentElement.style;
		root.setProperty('--vt-out-name', isBack ? 'vt-page-out-back' : 'vt-page-out');
		root.setProperty('--vt-in-name', isBack ? 'vt-page-in-back' : 'vt-page-in');

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<svelte:head><link rel="icon" href="/favicon.svg" /></svelte:head>

<SabbatBackground />
<SeasonalThemeUpdater />
<AmbianceEngine />
<WolfPawTrail />
<MondayEgg />
<IdleEgg />
<ThreeToast />
<BlogArchiveEggs />
<!-- Shared SVG filters for .text-outline. Dilates the glyphs and cuts the
     original out, leaving only the true outer contour — unlike
     -webkit-text-stroke, which traces every overlapping contour inside
     Inter's variable glyphs and draws stray lines through them. -->
<svg class="svg-defs" aria-hidden="true" focusable="false">
	<filter id="text-outline" x="-10%" y="-40%" width="120%" height="180%" color-interpolation-filters="sRGB">
		<feMorphology in="SourceGraphic" operator="dilate" radius="2" result="thick" />
		<feComposite in="thick" in2="SourceGraphic" operator="out" />
	</filter>
	<filter id="text-outline-thin" x="-10%" y="-40%" width="120%" height="180%" color-interpolation-filters="sRGB">
		<feMorphology in="SourceGraphic" operator="dilate" radius="1.25" result="thick" />
		<feComposite in="thick" in2="SourceGraphic" operator="out" />
	</filter>
</svg>
<a class="skip-to-content" href="#main-content">Skip to content</a>
<Header />
{#if dev}<span class="dev-chip">DEV</span>{/if}
<div class="shell-main" id="main-content" tabindex="-1">
	{@render children()}
</div>
<BacklinkAvatars />
<Footer siteInfo={data.siteInfo} />
