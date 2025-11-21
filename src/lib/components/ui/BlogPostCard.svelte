<script lang="ts">
	import { ExternalLink } from '@lucide/svelte';
	import type { BlogPost } from '$lib/services/atproto';
	import { getPostBadges, getBadgeClasses } from '$lib/helper/badges';
	import { formatLocalizedDate } from '$lib/utils/locale';

	interface Props {
		post: BlogPost;
		locale?: string;
	}

	let { post, locale }: Props = $props();

	const badges = $derived(getPostBadges(post));
</script>

<a
	href={post.url}
	target="_blank"
	rel="noopener noreferrer"
	class="flex items-start justify-between gap-3 rounded-lg bg-canvas-200 p-4 transition-colors hover:bg-canvas-300 dark:bg-canvas-800 dark:hover:bg-canvas-700"
>
	<div class="flex-1 space-y-1">
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
		<h4 class="overflow-wrap-anywhere font-semibold break-words text-ink-900 dark:text-ink-50">
			{post.title}
		</h4>

		<!-- Description -->
		{#if post.description}
			<p
				class="overflow-wrap-anywhere line-clamp-2 text-sm break-words text-ink-700 dark:text-ink-200"
			>
				{post.description}
			</p>
		{/if}

		<!-- Timestamp -->
		<p class="text-xs font-medium text-ink-800 dark:text-ink-100">
			{formatLocalizedDate(post.createdAt, locale)}
		</p>
	</div>

	<!-- External Link Icon -->
	<ExternalLink
		class="h-4 w-4 flex-shrink-0 text-ink-700 transition-colors group-hover:text-primary-600 dark:text-ink-200 dark:group-hover:text-primary-400"
		aria-hidden="true"
	/>
</a>
