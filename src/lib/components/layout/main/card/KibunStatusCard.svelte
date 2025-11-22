<script lang="ts">
	import { onMount } from 'svelte';
	import { Card } from '$lib/components/ui';
	import { fetchKibunStatus, type KibunStatusData } from '$lib/services/atproto';
	import { formatRelativeTime } from '$lib/utils/formatDate';

	// Icons
	import { Heart } from '@lucide/svelte';

	let kibunStatus: KibunStatusData | null = null;
	let loading = true;
	let error: string | null = null;

	onMount(async () => {
		try {
			kibunStatus = await fetchKibunStatus();
			if (kibunStatus) {
				console.log('[KibunStatusCard] Kibun status loaded:', kibunStatus);
			}
		} catch (err) {
			console.error('[KibunStatusCard] Error loading kibun status:', err);
			error = err instanceof Error ? err.message : 'Failed to load kibun status';
		} finally {
			loading = false;
		}
	});
</script>

<div class="mx-auto w-full max-w-2xl">
	{#if loading}
		<Card loading={true} variant="elevated" padding="md">
			{#snippet skeleton()}
				<div class="mb-3">
					<div class="mb-2 flex items-center gap-2">
						<div class="h-4 w-4 rounded bg-canvas-300 dark:bg-canvas-700"></div>
						<div class="h-3 w-24 rounded bg-canvas-300 dark:bg-canvas-700"></div>
					</div>
					<div class="mb-2 flex items-center gap-3">
						<div class="h-12 w-12 rounded bg-canvas-300 dark:bg-canvas-700"></div>
						<div class="h-6 w-48 rounded bg-canvas-300 dark:bg-canvas-700"></div>
					</div>
					<div class="h-3 w-32 rounded bg-canvas-300 dark:bg-canvas-700"></div>
				</div>
			{/snippet}
		</Card>
	{:else if error}
		<Card error={true} errorMessage={error} />
	{:else if kibunStatus}
		{@const safeKibunStatus = kibunStatus}
		<Card variant="elevated" padding="md">
			{#snippet children()}
				<div>
					<!-- Header -->
					<div class="mb-4 flex items-center gap-2">
						<Heart class="h-4 w-4 text-primary-600 dark:text-primary-400" aria-hidden="true" />
						<span
							class="text-xs font-semibold tracking-wide text-ink-800 uppercase dark:text-ink-100"
						>
							Current Mood
						</span>
					</div>

					<!-- Content -->
					<div class="mb-4 flex items-center gap-3">
						<!-- Emoji -->
						<div
							class="flex h-12 w-12 items-center justify-center rounded-lg bg-canvas-100 text-3xl dark:bg-canvas-800"
						>
							{safeKibunStatus.emoji}
						</div>

						<!-- Status Text -->
						<p
							class="flex-1 text-lg font-medium wrap-break-word whitespace-normal text-ink-900 dark:text-ink-50"
						>
							{safeKibunStatus.text}
						</p>
					</div>

					<!-- Footer / Meta -->
					<div class="text-xs text-ink-700 dark:text-ink-200">
						<time datetime={safeKibunStatus.createdAt}>
							{formatRelativeTime(safeKibunStatus.createdAt)}
						</time>
					</div>
				</div>
			{/snippet}
		</Card>
	{/if}
</div>
