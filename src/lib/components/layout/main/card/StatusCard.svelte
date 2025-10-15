<script lang="ts">
	import { onMount } from 'svelte';
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
		<div class="animate-pulse rounded-xl bg-canvas-200 p-4 shadow-md dark:bg-canvas-800">
			<div class="mb-2 h-4 w-3/4 rounded bg-canvas-300 dark:bg-canvas-700"></div>
			<div class="h-3 w-1/2 rounded bg-canvas-300 dark:bg-canvas-700"></div>
		</div>
	{:else if error}
		<p class="text-red-600 dark:text-red-400">{error}</p>
	{:else if status}
		<div class="rounded-xl bg-canvas-100 p-4 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-canvas-900">
			<div class="mb-2 flex items-center gap-2">
				<Rss class="h-4 w-4 text-sage-500" aria-hidden="true" />
				<span class="text-xs font-semibold tracking-wide text-ink-700 uppercase dark:text-ink-200">
					Current Status
				</span>
			</div>

			<p class="mb-2 text-lg font-medium text-ink-900 dark:text-ink-50">
				{status.text}
			</p>

			<time datetime={status.createdAt} class="text-xs text-ink-700 dark:text-ink-200">
				{formatRelativeTime(status.createdAt)}
			</time>
		</div>
	{/if}
</div>
