<script lang="ts">
	import { ExternalLink, Tag } from '@lucide/svelte';
	import type { BlogPost } from '$lib/services/atproto';
	import { InternalCard } from '$lib/components/ui';
	import { getPostBadges, getBadgeClasses } from '$lib/helper/badges';
	import { formatLocalizedDate } from '$lib/utils/locale';

	interface Props {
		post: BlogPost;
		locale?: string;
	}

	let { post, locale }: Props = $props();

	const badges = $derived(getPostBadges(post));
</script>

<InternalCard href={post.url}>
	{#snippet children()}
		<div class="relative min-w-0 flex-1 space-y-2">
			<!-- Badges: Platform and Publication -->
			{#if badges.length > 0}
				<div class="flex flex-wrap items-center gap-2">
					{#each badges as badge}
						<span class={getBadgeClasses(badge)}>
							{badge.text}
						</span>
					{/each}
				</div>
			{/if}

			<!-- Title -->
			<h4
				class="overflow-wrap-anywhere font-semibold wrap-break-word text-ink-900 dark:text-ink-50"
			>
				{post.title}
			</h4>

			<!-- Description -->
			{#if post.description}
				<p
					class="overflow-wrap-anywhere line-clamp-2 text-sm wrap-break-word text-ink-700 dark:text-ink-200"
				>
					{post.description}
				</p>
			{/if}

			<!-- Timestamp -->
			<div class="pt-1">
				<p class="text-xs font-medium text-ink-800 dark:text-ink-100">
					{formatLocalizedDate(post.createdAt, locale)}
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
			{#if post.tags && post.tags.length > 0}
				<div class="flex items-center gap-1.5 rounded bg-ink-100 px-2 py-0.5 dark:bg-ink-800">
					<Tag class="h-3 w-3 text-ink-700 dark:text-ink-200" aria-hidden="true" />
					<span class="text-xs font-medium text-ink-800 dark:text-ink-100">
						{post.tags.length}
					</span>
				</div>
			{/if}
		</div>
	{/snippet}
</InternalCard>
