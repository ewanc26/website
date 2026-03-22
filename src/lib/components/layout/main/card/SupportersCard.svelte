<script lang="ts">
	import { Heart, ExternalLink } from '@lucide/svelte';
	import { Card, NoiseImage } from '$lib/components/ui';
	import type { KofiSupportEvent, KofiEventType } from '$lib/services/atproto';

	interface Props {
		supporters?: KofiSupportEvent[] | null;
	}

	let { supporters = null }: Props = $props();

	const TYPE_LABELS: Record<KofiEventType, string> = {
		Donation: '☕',
		Subscription: '⭐',
		Commission: '🎨',
		'Shop Order': '🛍️'
	};

	const TYPE_DESCRIPTIONS: Record<KofiEventType, string> = {
		Donation: 'donated',
		Subscription: 'subscribed',
		Commission: 'commissioned',
		'Shop Order': 'placed a shop order'
	};

	function formatDate(date: Date): string {
		return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
	}
</script>

<div class="mx-auto w-full max-w-2xl">
	{#if !supporters}
		<Card loading={true} variant="elevated" padding="md">
			{#snippet skeleton()}
				<div class="mb-4 h-6 w-40 rounded bg-canvas-300 dark:bg-canvas-700"></div>
				<div class="space-y-4">
					{#each Array(4) as _}
						<div class="flex items-center gap-3">
							<div class="h-8 w-8 shrink-0 rounded-full bg-canvas-300 dark:bg-canvas-700"></div>
							<div class="flex-1 space-y-1.5">
								<div class="h-3.5 w-32 rounded bg-canvas-300 dark:bg-canvas-700"></div>
								<div class="h-3 w-20 rounded bg-canvas-300 dark:bg-canvas-700"></div>
							</div>
						</div>
					{/each}
				</div>
			{/snippet}
		</Card>
	{:else if supporters.length > 0}
		<Card variant="elevated" padding="md">
			{#snippet children()}
				<div class="mb-4 flex items-center gap-2">
					<Heart class="h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
					<h2 class="text-2xl font-bold text-ink-900 dark:text-ink-50">Supporters</h2>
				</div>
				<ol class="space-y-3" aria-label="Ko-fi support timeline">
					{#each supporters as event (event.rkey)}
						<li class="flex items-start gap-3">
							<NoiseImage
							seed={`${event.name}|${event.type}`}
							class="mt-0.5 h-8 w-8 shrink-0 rounded-full"
							/>
							<div class="flex flex-col">
								<p class="text-sm text-ink-900 dark:text-ink-100">
									<span class="font-semibold">{event.name}</span>
									<span class="text-ink-600 dark:text-ink-400"> {TYPE_DESCRIPTIONS[event.type]}</span>
									<span class="ml-1" aria-label={event.type}>{TYPE_LABELS[event.type]}</span>
									{#if event.tier}
										<span class="ml-1 text-xs text-ink-500 dark:text-ink-500">· {event.tier}</span>
									{/if}
								</p>
								<time
									datetime={event.date.toISOString()}
									class="text-xs text-ink-500 dark:text-ink-500"
								>
									{formatDate(event.date)}
								</time>
							</div>
						</li>
					{/each}
				</ol>
				<div class="mt-4 border-t border-canvas-200 pt-4 dark:border-canvas-700">
					<a
						href="https://ko-fi.com/ewancroft"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-2 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
					>
						Support me on Ko-fi
						<ExternalLink class="h-3.5 w-3.5" aria-hidden="true" />
					</a>
				</div>
			{/snippet}
		</Card>
	{/if}
</div>
