<script lang="ts">
	import { onMount } from 'svelte';
	import { X } from '@lucide/svelte';
	import Card from '$lib/components/ui/Card.svelte';

	interface Props {
		show: boolean;
		onClose: () => void;
	}

	let { show, onClose }: Props = $props();
	let ref = $state<HTMLDivElement>();

	onMount(() => {
		// Move the modal to body to escape stacking context issues
		if (ref) {
			document.body.appendChild(ref);
		}

		return () => {
			// Cleanup
			if (ref && document.body.contains(ref)) {
				document.body.removeChild(ref);
			}
		};
	});
</script>

{#if show}
	<div
		bind:this={ref}
		class="fixed inset-0 z-9999 flex items-center justify-center bg-black/70 p-4"
		onclick={onClose}
		onkeydown={(e) => e.key === 'Escape' && onClose()}
		role="button"
		tabindex="0"
		aria-label="Close decimal time info"
	>
		<div
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="dialog"
			aria-labelledby="decimal-time-title"
			aria-modal="true"
			tabindex="-1"
			class="w-full max-w-2xl"
		>
			<Card
				variant="elevated"
				padding="lg"
				class="relative max-h-[90vh] overflow-y-auto"
			>
				{#snippet children()}
					<!-- Close button -->
					<button
						type="button"
						onclick={onClose}
						class="absolute top-4 right-4 rounded-lg p-2 text-ink-600 transition-colors hover:bg-canvas-200 dark:text-ink-400 dark:hover:bg-canvas-800"
						aria-label="Close"
					>
						<X class="h-6 w-6" />
					</button>

					<!-- Content -->
					<div class="space-y-4">
						<h2 id="decimal-time-title" class="text-2xl font-bold text-ink-900 dark:text-ink-50">
							French Revolutionary Decimal Time
						</h2>

						<div class="space-y-3 text-ink-700 dark:text-ink-200">
							<p>
								Decimal time was introduced during the French Revolution as part of the metric
								system. Instead of dividing the day into 24 hours, it uses a base-10 system:
							</p>

							<ul class="list-disc space-y-2 pl-6">
								<li><strong>1 day</strong> = 10 decimal hours</li>
								<li><strong>1 decimal hour</strong> = 100 decimal minutes</li>
								<li><strong>1 decimal minute</strong> = 100 decimal seconds</li>
							</ul>

							<p>
								This means a decimal day has 10 hours, 1,000 minutes, and 100,000 seconds
								total.
							</p>

							<Card variant="flat" padding="md" class="bg-canvas-200 dark:bg-canvas-800">
								{#snippet children()}
									<h3 class="mb-2 font-semibold text-ink-900 dark:text-ink-50">
										Conversions:
									</h3>
									<ul class="space-y-1 text-sm">
										<li>1 decimal hour ≈ 2.4 traditional hours (2h 24m)</li>
										<li>1 decimal minute ≈ 1.44 traditional minutes (86.4 seconds)</li>
										<li>1 decimal second ≈ 0.864 traditional seconds</li>
									</ul>
								{/snippet}
							</Card>

							<p class="text-sm text-ink-600 dark:text-ink-400">
								While decimal time was officially adopted in France from 1793-1795, it never
								gained widespread acceptance and was eventually abandoned in favor of the
								traditional 24-hour system.
							</p>

							<p class="text-sm text-ink-600 dark:text-ink-400">
								I just found it interesting, I learnt about it from <a
									href="https://www.youtube.com/watch?v=Ax7AbXfhftE"
									target="_blank"
									rel="noopener noreferrer"
									class="underline hover:text-primary-500 dark:hover:text-primary-400"
									>"The Longest Softlock in Portal" by Marblr on YouTube</a
								>.
							</p>
						</div>
					</div>
				{/snippet}
			</Card>
		</div>
	</div>
{/if}
