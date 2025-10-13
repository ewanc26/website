<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchStatus, type StatusData } from '$lib/services/atproto';

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

	function formatRelativeTime(dateString: string): string {
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMins / 60);
		const diffDays = Math.floor(diffHours / 24);

		if (diffMins < 1) return 'just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;

		return date.toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
		});
	}
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
		<div
			class="rounded-xl bg-canvas-100 p-4 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-canvas-900"
		>
			<div class="mb-2 flex items-center gap-2">
				<div class="h-3 w-3 animate-pulse rounded-full bg-sage-500"></div>
				<span class="text-xs font-semibold tracking-wide text-ink-600 uppercase dark:text-ink-400">
					Current Status
				</span>
			</div>

			<p class="mb-2 text-lg font-medium text-ink-900 dark:text-ink-50">
				{status.text}
			</p>

			<time datetime={status.createdAt} class="text-xs text-ink-600 dark:text-ink-400">
				{formatRelativeTime(status.createdAt)}
			</time>
		</div>
	{/if}
</div>
