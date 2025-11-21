<script lang="ts">
	import { ExternalLink } from '@lucide/svelte';
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
		<div class="min-w-0 flex-1 space-y-2">
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
			<p class="text-xs font-medium text-ink-800 dark:text-ink-100">
				{formatLocalizedDate(post.createdAt, locale)}
			</p>
		</div>

		<!-- External Link Icon -->
		<ExternalLink
			class="h-4 w-4 shrink-0 text-ink-700 transition-colors dark:text-ink-200"
			aria-hidden="true"
		/>
	{/snippet}
</InternalCard>
