<script lang="ts">
	import { Card } from '$lib/components/ui';
	import { DocumentCard } from '$lib/components/ui';
	import type { StandardSiteDocument } from '$lib/services/atproto';

	interface Props {
		documents?: StandardSiteDocument[] | null;
	}

	let { documents = null }: Props = $props();
</script>

<div class="mx-auto w-full max-w-2xl">
	{#if !documents}
		<Card loading={true} variant="elevated" padding="md">
			{#snippet skeleton()}
				<div class="mb-4 h-6 w-32 rounded bg-canvas-300 dark:bg-canvas-700"></div>
				<div class="space-y-3">
					{#each Array(3) as _}
						<div class="rounded-lg bg-canvas-200 p-4 dark:bg-canvas-800">
							<div class="mb-2 h-5 w-3/4 rounded bg-canvas-300 dark:bg-canvas-700"></div>
							<div class="mb-2 h-4 w-full rounded bg-canvas-300 dark:bg-canvas-700"></div>
							<div class="h-3 w-24 rounded bg-canvas-300 dark:bg-canvas-700"></div>
						</div>
					{/each}
				</div>
			{/snippet}
		</Card>
	{:else if documents && documents.length > 0}
		<Card variant="elevated" padding="md">
			{#snippet children()}
				<h2 class="mb-4 text-2xl font-bold text-ink-900 dark:text-ink-50">Recent Posts</h2>
				<div class="space-y-3">
					{#each documents as document}
						<DocumentCard {document} />
					{/each}
				</div>
			{/snippet}
		</Card>
	{:else}
		<Card variant="flat" padding="lg">
			{#snippet children()}
				<div class="text-center">
					<p class="text-ink-700 dark:text-ink-300">
						No documents available. Start writing on
						<a
							href="https://standard.site/"
							class="text-primary-600 hover:underline dark:text-primary-400"
							target="_blank"
							rel="noopener noreferrer">Standard.site</a
						>
						to get started!
					</p>
				</div>
			{/snippet}
		</Card>
	{/if}
</div>
