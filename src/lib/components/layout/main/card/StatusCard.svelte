<script lang="ts">
	import { onMount } from 'svelte';
	import { Card } from '$lib/components/ui';
	import { fetchStatus, type StatusData } from '$lib/services/atproto';
	import { formatRelativeTime } from '$lib/utils/formatDate';
	import { Rss } from '@lucide/svelte';

	let status: StatusData | null = null;
	let loading = true;
	let error: string | null = null;

	onMount(async () => {
		try {
			status = await fetchStatus();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load status';
		} finally {
			loading = false;
		}
	});
</script>

<div class="mx-auto w-full max-w-2xl">
	{#if loading}
		<Card loading={true} variant="elevated" padding="md">
			{#snippet skeleton()}
				<div class="mb-2 flex items-center gap-2">
					<div class="h-4 w-4 rounded bg-canvas-300 dark:bg-canvas-700"></div>
					<div class="h-3 w-24 rounded bg-canvas-300 dark:bg-canvas-700"></div>
				</div>
				<div class="mb-2 h-5 w-3/4 rounded bg-canvas-300 dark:bg-canvas-700"></div>
				<div class="h-3 w-32 rounded bg-canvas-300 dark:bg-canvas-700"></div>
			{/snippet}
		</Card>
	{:else if error}
		<Card error={true} errorMessage={error} />
	{:else if status}
		{@const safeStatus = status}
		<Card variant="elevated" padding="md">
			{#snippet children()}
				<div class="mb-2 flex items-center gap-2">
					<Rss class="h-4 w-4 text-primary-600 dark:text-primary-400" aria-hidden="true" />
					<span
						class="text-xs font-semibold tracking-wide text-ink-800 uppercase dark:text-ink-100"
					>
						Current Status
					</span>
				</div>

				<p class="mb-2 overflow-wrap-anywhere break-words text-lg font-medium text-ink-900 dark:text-ink-50">
					{safeStatus.text}
				</p>

				<time datetime={safeStatus.createdAt} class="text-xs font-medium text-ink-800 dark:text-ink-100">
					{formatRelativeTime(safeStatus.createdAt)}
				</time>
			{/snippet}
		</Card>
	{/if}
</div>
