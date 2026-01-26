<script lang="ts">
	import { ExternalLink, Tag } from '@lucide/svelte';
	import type { StandardSiteDocument } from '$lib/services/atproto';
	import { InternalCard } from '$lib/components/ui';
	import { formatLocalizedDate } from '$lib/utils/locale';

	interface Props {
		document: StandardSiteDocument;
		locale?: string;
	}

	let { document, locale }: Props = $props();
</script>

<InternalCard href={document.url}>
	{#snippet children()}
		<!-- Cover Image -->
		{#if document.coverImage}
			<div class="mb-3 overflow-hidden rounded-lg">
				<img
					src={document.coverImage}
					alt={document.title}
					class="h-48 w-full object-cover transition-transform duration-300 hover:scale-105"
				/>
			</div>
		{/if}

		<div class="relative min-w-0 flex-1 space-y-2">
			<!-- Publication Badge -->
			{#if document.publicationName}
				<div class="flex flex-wrap items-center gap-2">
					<span
						class="rounded bg-accent-500 px-2 py-0.5 text-xs font-semibold text-white uppercase dark:bg-accent-600"
					>
						{document.publicationName}
					</span>
				</div>
			{/if}

			<!-- Title -->
			<h4
				class="overflow-wrap-anywhere font-semibold wrap-break-word text-ink-900 dark:text-ink-50"
			>
				{document.title}
			</h4>

			<!-- Description -->
			{#if document.description}
				<p
					class="overflow-wrap-anywhere line-clamp-2 text-sm wrap-break-word text-ink-700 dark:text-ink-200"
				>
					{document.description}
				</p>
			{/if}

			<!-- Timestamp -->
			<div class="pt-1">
				<p class="text-xs font-medium text-ink-800 dark:text-ink-100">
					{formatLocalizedDate(document.publishedAt, locale)}
				</p>
			</div>
		</div>

		<!-- Right column: External Link Icon and Tags -->
		<div class="flex shrink-0 flex-col items-end justify-between gap-2 self-stretch">
			<!-- External Link Icon -->
			<ExternalLink
				class="h-4 w-4 text-ink-700 transition-colors dark:text-ink-200"
				aria-hidden="true"
			/>

			<!-- Tags -->
			{#if document.tags && document.tags.length > 0}
				<div class="flex items-center gap-1.5 rounded bg-ink-100 px-2 py-0.5 dark:bg-ink-800">
					<Tag class="h-3 w-3 text-ink-700 dark:text-ink-200" aria-hidden="true" />
					<span class="text-xs font-medium text-ink-800 dark:text-ink-100">
						{document.tags.length}
					</span>
				</div>
			{/if}
		</div>
	{/snippet}
</InternalCard>
