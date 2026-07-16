<script lang="ts">
	import { onMount } from 'svelte';
	import LoadingSkeleton from '$lib/components/LoadingSkeleton.svelte';

	interface Props {
		url: string;
		aturi?: string;
		variant?: 'default' | 'minimal' | 'full' | 'mentions';
		class?: string;
	}

	let { url, aturi, variant = 'default', class: className = '' }: Props = $props();

	let ready = $state(false);
	let failed = $state(false);

	onMount(() => {
		// Import registers the <atmentions-reactions> custom element automatically.
		import('atmentions').then(() => {
			ready = true;
		}).catch(() => {
			failed = true;
		});
	});
</script>

<div
	class={`atmentions-wrapper ${className}`}
	style:--atmo-fg="var(--color-ink-800)"
	style:--atmo-accent="var(--color-primary-500)"
	style:--atmo-muted="var(--color-ink-600)"
>
	{#if ready}
		<atmentions-reactions
			data-url={url}
			data-aturi={aturi || undefined}
			variant={variant}
		></atmentions-reactions>
	{:else if !failed}
		<LoadingSkeleton label="Loading reactions" />
	{/if}
</div>
