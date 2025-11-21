<script lang="ts">
	import { onMount } from 'svelte';
	import { Card } from '$lib/components/ui';
	import { fetchBlogPosts, type BlogPostsData, type BlogPost } from '$lib/services/atproto';
	import { formatRelativeTime } from '$lib/utils/formatDate';
	import { ExternalLink } from '@lucide/svelte';

	let blogPosts: BlogPostsData | null = null;
	let loading = true;
	let error: string | null = null;

	onMount(async () => {
		try {
			blogPosts = await fetchBlogPosts();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load blog posts';
		} finally {
			loading = false;
		}
	});

	/**
	 * Get badge configuration for a post based on platform and publication
	 */
	function getPostBadges(post: BlogPost) {
		const badges: Array<{ text: string; color: 'mint' | 'sage'; variant: 'soft' | 'solid' }> = [];

		// Platform badge
		if (post.platform === 'WhiteWind') {
			badges.push({ text: 'WhiteWind', color: 'mint', variant: 'soft' });
		} else if (post.platform === 'leaflet') {
			badges.push({ text: 'Leaflet', color: 'sage', variant: 'soft' });
		}

		// Publication name badge for Leaflet posts
		if (post.publicationName && post.platform === 'leaflet') {
			badges.push({ text: post.publicationName, color: 'sage', variant: 'solid' });
		}

		return badges;
	}
</script>

<div class="mx-auto w-full max-w-2xl">
	{#if loading}
		<Card loading={true} variant="elevated" padding="md">
			{#snippet skeleton()}
				<div class="mb-4 h-6 w-32 rounded bg-canvas-300 dark:bg-canvas-700"></div>
				<div class="space-y-3">
					{#each Array(3) as _}
						<div class="rounded-lg bg-canvas-200 p-4 dark:bg-canvas-800">
							<div class="mb-2 flex gap-2">
								<div class="h-5 w-16 rounded bg-canvas-300 dark:bg-canvas-700"></div>
								<div class="h-5 w-20 rounded bg-canvas-300 dark:bg-canvas-700"></div>
							</div>
							<div class="mb-2 h-5 w-3/4 rounded bg-canvas-300 dark:bg-canvas-700"></div>
							<div class="mb-2 h-4 w-full rounded bg-canvas-300 dark:bg-canvas-700"></div>
							<div class="h-3 w-24 rounded bg-canvas-300 dark:bg-canvas-700"></div>
						</div>
					{/each}
				</div>
			{/snippet}
		</Card>
	{:else if error}
		<Card error={true} errorMessage={error} />
	{:else if blogPosts && blogPosts.posts && blogPosts.posts.length > 0}
		<Card variant="elevated" padding="md">
			{#snippet children()}
				<h2 class="mb-4 text-2xl font-bold text-ink-900 dark:text-ink-50">Recent Posts</h2>
				<div class="space-y-3">
					{#each blogPosts?.posts ?? [] as post}
						<a
							href={post.url}
							target="_blank"
							rel="noopener noreferrer"
							class="flex items-start justify-between gap-3 rounded-lg bg-canvas-200 p-4 transition-colors hover:bg-canvas-300 dark:bg-canvas-800 dark:hover:bg-canvas-700"
						>
							<div class="flex-1 space-y-1">
								<!-- Badges: Platform and Publication -->
								{#if getPostBadges(post).length > 0}
									<div class="flex flex-wrap items-center gap-2">
										{#each getPostBadges(post) as badge}
											{#if badge.variant === 'soft'}
												<span
													class="rounded px-2 py-0.5 text-xs font-medium {badge.color === 'mint'
														? 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-200'
														: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'}"
												>
													{badge.text}
												</span>
											{:else}
												<span
													class="rounded px-2 py-0.5 text-xs font-semibold uppercase {badge.color ===
													'mint'
														? 'bg-secondary-500 text-white dark:bg-secondary-600'
														: 'bg-primary-500 text-white dark:bg-primary-600'}"
												>
													{badge.text}
												</span>
											{/if}
										{/each}
									</div>
								{/if}

								<!-- Title -->
								<h3
									class="overflow-wrap-anywhere font-semibold wrap-break-word text-ink-900 dark:text-ink-50"
								>
									{post.title}
								</h3>

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
									{formatRelativeTime(post.createdAt)}
								</p>
							</div>

							<!-- External Link Icon -->
							<ExternalLink
								class="h-4 w-4 flex-shrink-0 text-ink-700 transition-colors group-hover:text-primary-600 dark:text-ink-200 dark:group-hover:text-primary-400"
								aria-hidden="true"
							/>
						</a>
					{/each}
				</div>
			{/snippet}
		</Card>
	{:else}
		<Card variant="flat" padding="lg">
			{#snippet children()}
				<div class="text-center">
					<p class="text-ink-700 dark:text-ink-300">
						No blog posts available. Write on
						<a
							href="https://whtwnd.com/"
							class="text-primary-600 hover:underline dark:text-primary-400"
							target="_blank"
							rel="noopener noreferrer">WhiteWind</a
						>
						or
						<a
							href="https://leaflet.pub/"
							class="text-primary-600 hover:underline dark:text-primary-400"
							target="_blank"
							rel="noopener noreferrer">Leaflet</a
						>
						to get started!
					</p>
				</div>
			{/snippet}
		</Card>
	{/if}
</div>
