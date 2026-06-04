<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import { dev } from '$app/environment';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import SabbatBackground from '$lib/components/SabbatBackground.svelte';
	import './layout.css';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href="/favicon.svg" /></svelte:head>

<SabbatBackground />
<Header />
{#if dev}<span class="dev-chip">DEV</span>{/if}
<main class="shell-main">
	{@render children()}
</main>
<Footer />
