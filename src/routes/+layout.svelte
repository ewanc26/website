<script lang="ts">
	import { fade } from 'svelte/transition';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children, data } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div style="min-height: 100vh; display: flex; flex-direction: column;">
    <Header />
    {#key data.url}
        <div in:fade={{ duration: 300, delay: 300 }} out:fade={{ duration: 300 }} style="flex: 1;">
            {@render children()}
        </div>
    {/key}
    <Footer />
</div>
