<script lang="ts">
	import { onMount } from 'svelte';
	import { Card } from '$lib/components/ui';
	import { BlogPostCard } from '$lib/components/ui';
	import { fetchBlogPosts, type BlogPostsData } from '$lib/services/atproto';

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
						<BlogPostCard {post} />
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
