<script lang="ts">
	import { Heart, ExternalLink } from '@lucide/svelte';
	import { Card, NoiseImage } from '$lib/components/ui';
	import type { UnifiedSupportEvent, KofiEventType, GitHubSponsorshipAction } from '$lib/services/atproto';
	import { PUBLIC_KOFI_PAGE_ID, PUBLIC_GITHUB_USERNAME } from '$env/static/public';

	interface Props {
		supporters?: UnifiedSupportEvent[] | null;
	}

	let { supporters = null }: Props = $props();

	const KOFI_TYPE_LABELS: Record<KofiEventType, string> = {
		Donation: '☕',
		Subscription: '⭐',
		Commission: '🎨',
		'Shop Order': '🛍️'
	};

	const KOFI_TYPE_DESCRIPTIONS: Record<KofiEventType, string> = {
		Donation: 'donated',
		Subscription: 'subscribed',
		Commission: 'commissioned',
		'Shop Order': 'placed a shop order'
	};

	const GITHUB_ACTION_LABELS: Record<GitHubSponsorshipAction, string> = {
		created: 'started sponsoring',
		cancelled: 'ended their sponsorship',
		edited: 'updated their sponsorship',
		tier_changed: 'changed sponsorship tier',
		pending_cancellation: 'scheduled cancellation',
		pending_tier_change: 'scheduled a tier change'
	};

	function formatDate(date: Date): string {
		return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
	}

	function noiseKey(event: UnifiedSupportEvent): string {
		if (event.source === 'kofi') return `${event.name}|${event.type}`;
		return `${event.login}|${event.action}`;
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
				<ol class="space-y-3" aria-label="Support timeline">
					{#each supporters as event (event.rkey)}
						<li class="flex items-start gap-3">
							<NoiseImage
								seed={noiseKey(event)}
								class="mt-0.5 h-8 w-8 shrink-0 rounded-full"
							/>
							<div class="flex flex-col">
								{#if event.source === 'kofi'}
									<p class="text-sm text-ink-900 dark:text-ink-100">
										<span class="font-semibold">{event.name}</span>
										<span class="text-ink-600 dark:text-ink-400"> {KOFI_TYPE_DESCRIPTIONS[event.type]}</span>
										<span class="ml-1" aria-label={event.type}>{KOFI_TYPE_LABELS[event.type]}</span>
										{#if event.tier}
											<span class="ml-1 text-xs text-ink-500 dark:text-ink-500">· {event.tier}</span>
										{/if}
									</p>
								{:else}
									<p class="text-sm text-ink-900 dark:text-ink-100">
										<span class="font-semibold">{event.name ?? event.login}</span>
										<span class="text-ink-600 dark:text-ink-400"> {GITHUB_ACTION_LABELS[event.action]}</span>
										<span class="ml-1 text-xs text-ink-500 dark:text-ink-500">· {event.tierName} · via GitHub</span>
									</p>
								{/if}
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
				<div class="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-canvas-200 pt-4 dark:border-canvas-700">
					{#if PUBLIC_KOFI_PAGE_ID}
					<a
						href="https://ko-fi.com/{PUBLIC_KOFI_PAGE_ID}"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-2 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
					>
						Support me on Ko-fi
						<ExternalLink class="h-3.5 w-3.5" aria-hidden="true" />
					</a>
					{/if}
					{#if PUBLIC_GITHUB_USERNAME}
					<a
						href="https://github.com/sponsors/{PUBLIC_GITHUB_USERNAME}"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-2 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
					>
						Sponsor me on GitHub
						<ExternalLink class="h-3.5 w-3.5" aria-hidden="true" />
					</a>
					{/if}
				</div>
			{/snippet}
		</Card>
	{/if}
</div>
