<script lang="ts">
	import { Heart } from '@lucide/svelte';
	import { Card } from '$lib/components/ui';
	import type { KofiSupporter, KofiEventType } from '$lib/services/atproto';

	interface Props {
		supporters?: KofiSupporter[] | null;
	}

	let { supporters = null }: Props = $props();

	const TYPE_LABELS: Record<KofiEventType, string> = {
		Donation: '☕',
		Subscription: '⭐',
		Commission: '🎨',
		'Shop Order': '🛍️'
	};

	/** Deterministic pastel hue from a name string. */
	function nameToHsl(name: string): string {
		let hash = 0;
		for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
		const h = Math.abs(hash) % 360;
		return `hsl(${h} 55% 70%)`;
	}

	/** Up-to-two-letter initials from a display name. */
	function initials(name: string): string {
		return name
			.split(/\s+/)
			.slice(0, 2)
			.map((w) => w[0]?.toUpperCase() ?? '')
			.join('');
	}
</script>

<div class="mx-auto w-full max-w-2xl">
	{#if !supporters}
		<Card loading={true} variant="elevated" padding="md">
			{#snippet skeleton()}
				<div class="mb-4 h-6 w-40 rounded bg-canvas-300 dark:bg-canvas-700"></div>
				<div class="flex flex-wrap gap-3">
					{#each Array(6) as _}
						<div class="flex flex-col items-center gap-2 p-2">
							<div class="h-12 w-12 rounded-full bg-canvas-300 dark:bg-canvas-700"></div>
							<div class="h-3 w-14 rounded bg-canvas-300 dark:bg-canvas-700"></div>
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
				<p class="mb-4 text-sm text-ink-600 dark:text-ink-400">
					People who support my work on Ko-fi.
				</p>
				<ul class="flex flex-wrap gap-2" aria-label="Ko-fi supporters">
					{#each supporters as supporter (supporter.name)}
						{@const icons = supporter.types.map((t) => TYPE_LABELS[t]).join('')}
						<li>
							<div
								class="flex flex-col items-center gap-1 rounded-lg p-2 transition-colors hover:bg-canvas-100 dark:hover:bg-canvas-800"
								title="{supporter.name} · {supporter.types.join(', ')}{supporter.tiers.length ? ` · ${supporter.tiers.join(', ')}` : ''}"
							>
								<span
									class="flex h-12 w-12 items-center justify-content-center items-center justify-center rounded-full text-sm font-bold text-white"
									style="background-color: {nameToHsl(supporter.name)}"
									aria-hidden="true"
								>
									{initials(supporter.name)}
								</span>
								<span
									class="max-w-[4.5rem] overflow-hidden text-ellipsis whitespace-nowrap text-xs text-ink-800 dark:text-ink-200"
								>
									{supporter.name}
								</span>
								<span class="text-[0.65rem] leading-none" aria-label={supporter.types.join(', ')}>
									{icons}
								</span>
							</div>
						</li>
					{/each}
				</ul>
			{/snippet}
		</Card>
	{/if}
</div>
