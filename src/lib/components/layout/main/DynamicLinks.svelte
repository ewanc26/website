<script lang="ts">
	import { onMount } from 'svelte';
	import { Card } from '$lib/components/ui';
	import { LinkCard } from '$lib/components/layout/main/card';
	import { fetchLinks, type LinkData } from '$lib/services/atproto';

	let links: LinkData | null = null;
	let loading = true;
	let error: string | null = null;

	onMount(async () => {
		try {
			links = await fetchLinks();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load links';
		} finally {
			loading = false;
		}
	});
</script>

<div class="mx-auto w-full max-w-2xl">
	{#if loading}
		<Card loading={true} variant="elevated" padding="md">
			{#snippet skeleton()}
				<div class="mb-4 h-6 w-20 rounded bg-canvas-300 dark:bg-canvas-700"></div>
				<div class="grid gap-3 sm:grid-cols-2">
					{#each Array(4) as _}
						<div class="h-16 rounded-lg bg-canvas-300 dark:bg-canvas-700"></div>
					{/each}
				</div>
			{/snippet}
		</Card>
	{:else if error}
		<Card error={true} errorMessage={error} />
	{:else if links && links.cards.length > 0}
		{@const safeLinks = links}
		<Card variant="elevated" padding="md">
			{#snippet children()}
				<h2 class="mb-4 text-2xl font-bold text-ink-900 dark:text-ink-50">Links</h2>
				<div class="grid gap-3 sm:grid-cols-2">
					{#each safeLinks.cards as link}
						<LinkCard url={link.url} title={link.text} emoji={link.emoji} />
					{/each}
				</div>
			{/snippet}
		</Card>
	{:else}
		<Card variant="flat" padding="lg">
			{#snippet children()}
				<div class="text-center">
					<p class="text-ink-700 dark:text-ink-300">
						No links available. Create a <code
							class="rounded bg-canvas-200 px-1 dark:bg-canvas-800">blue.linkat.board</code
						> record at
						<a
							href="https://linkat.blue/"
							class="text-sage-600 hover:underline dark:text-sage-400"
							target="_blank"
							rel="noopener noreferrer">https://linkat.blue/</a
						>
					</p>
				</div>
			{/snippet}
		</Card>
	{/if}
</div>
