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
<WolfPawTrail />
<MondayEgg />
<IdleEgg />
<ThreeToast />
<BlogArchiveEggs />
<a class="skip-to-content" href="#main-content">Skip to content</a>
<Header />
{#if dev}<span class="dev-chip">DEV</span>{/if}
<div class="shell-main" id="main-content" tabindex="-1">
	{@render children()}
</div>
<BacklinkAvatars />
<Footer siteInfo={data.siteInfo} />
