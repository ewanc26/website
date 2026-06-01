<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import './layout.css';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href="/favicon.svg" /></svelte:head>

<Header />
<main class="shell-main">
	{@render children()}
</main>
<Footer />
