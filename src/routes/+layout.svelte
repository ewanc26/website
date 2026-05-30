<script lang="ts">
	import { fade } from 'svelte/transition';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children, data } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#key data.url}
	<div in:fade={{ duration: 300, delay: 300 }} out:fade={{ duration: 300 }}>
		{@render children()}
	</div>
{/key}
