<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchLatestBlueskyPost, type BlueskyPost } from '$lib/services/atproto';
	import { formatRelativeTime } from '$lib/utils/formatDate';
	import { Heart, Repeat2, MessageCircle, ExternalLink } from '@lucide/svelte';

	let post: BlueskyPost | null = null;
	let loading = true;
	let error: string | null = null;

	onMount(async () => {
		try {
			post = await fetchLatestBlueskyPost();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load latest post';
		} finally {
			loading = false;
		}
	});

	function formatNumber(num?: number): string {
		if (!num) return '0';
		if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
		if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
		return num.toString();
	}

	function getPostUrl(uri: string): string {
		// Convert AT URI to bsky.app URL
		// Format: at://did:plc:xxx/app.bsky.feed.post/rkey
		const parts = uri.split('/');
		const did = parts[2];
		const rkey = parts[4];
		return `https://bsky.app/profile/${did}/post/${rkey}`;
	}
</script>

<div class="mx-auto w-full max-w-2xl">
	{#if loading}
		<div class="animate-pulse rounded-xl bg-canvas-200 p-6 shadow-md dark:bg-canvas-800">
			<div class="mb-3 h-5 w-32 rounded bg-canvas-300 dark:bg-canvas-700"></div>
			<div class="mb-3 space-y-2">
				<div class="h-4 w-full rounded bg-canvas-300 dark:bg-canvas-700"></div>
				<div class="h-4 w-5/6 rounded bg-canvas-300 dark:bg-canvas-700"></div>
			</div>
			<div class="flex gap-4">
				<div class="h-3 w-12 rounded bg-canvas-300 dark:bg-canvas-700"></div>
				<div class="h-3 w-12 rounded bg-canvas-300 dark:bg-canvas-700"></div>
				<div class="h-3 w-12 rounded bg-canvas-300 dark:bg-canvas-700"></div>
			</div>
		</div>
	{:else if error}
		<div class="rounded-xl bg-red-50 p-6 text-center shadow-md dark:bg-red-900/20">
			<p class="text-red-600 dark:text-red-400">{error}</p>
		</div>
	{:else if post}
		<div
			class="rounded-xl bg-canvas-100 p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-canvas-900"
		>
			<div class="mb-3 flex items-center justify-between">
				<span
					class="text-xs font-semibold uppercase tracking-wide text-ink-800 dark:text-ink-100"
				>
					Latest Post
				</span>
				<a
					href={getPostUrl(post.uri)}
					target="_blank"
					rel="noopener noreferrer"
					class="text-sage-600 transition-colors hover:text-sage-700 dark:text-sage-400 dark:hover:text-sage-300"
					aria-label="View post on Bluesky"
				>
					<ExternalLink class="h-4 w-4" aria-hidden="true" />
				</a>
			</div>

			<p class="mb-4 whitespace-pre-wrap text-lg text-ink-900 dark:text-ink-50">
				{post.text}
			</p>

			{#if post.hasImages && post.imageUrls && post.imageUrls.length > 0}
				<div class="mb-4 grid gap-2 {post.imageUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}">
					{#each post.imageUrls as imageUrl}
						<img
							src={imageUrl}
							alt="Post attachment"
							class="h-auto w-full rounded-lg object-cover"
							loading="lazy"
						/>
					{/each}
				</div>
			{/if}

			{#if post.quotedPost}
				<div
					class="mb-4 overflow-hidden rounded-lg border-2 border-canvas-300 bg-canvas-50 transition-colors hover:border-canvas-400 dark:border-canvas-700 dark:bg-canvas-800 dark:hover:border-canvas-600"
				>
					<div class="p-3">
						<div class="mb-2 flex items-center gap-2">
							{#if post.quotedPost.author.avatar}
								<img
									src={post.quotedPost.author.avatar}
									alt={post.quotedPost.author.displayName || post.quotedPost.author.handle}
									class="h-5 w-5 rounded-full"
									loading="lazy"
								/>
							{:else}
								<div
									class="flex h-5 w-5 items-center justify-center rounded-full bg-sage-200 text-xs font-bold text-sage-800 dark:bg-sage-800 dark:text-sage-200"
								>
									{(post.quotedPost.author.displayName || post.quotedPost.author.handle).charAt(0).toUpperCase()}
								</div>
							{/if}
							<div class="flex-1 overflow-hidden">
								<div class="flex items-center gap-1.5">
									{#if post.quotedPost.author.displayName}
										<span class="truncate text-sm font-semibold text-ink-900 dark:text-ink-50">
											{post.quotedPost.author.displayName}
										</span>
									{/if}
									<span class="truncate text-sm text-ink-700 dark:text-ink-200">
										@{post.quotedPost.author.handle}
									</span>
								</div>
							</div>
						</div>

						<p class="mb-2 whitespace-pre-wrap text-sm text-ink-900 dark:text-ink-50">
							{post.quotedPost.text}
						</p>

						{#if post.quotedPost.hasImages && post.quotedPost.imageUrls && post.quotedPost.imageUrls.length > 0}
							<div
								class="grid gap-1.5 {post.quotedPost.imageUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}"
							>
								{#each post.quotedPost.imageUrls as imageUrl}
									<img
										src={imageUrl}
										alt="Quoted post attachment"
										class="h-auto w-full rounded object-cover"
										loading="lazy"
									/>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			{/if}

			<div class="flex items-center gap-6 text-sm">
				{#if post.likeCount !== undefined}
					<div class="flex items-center gap-1.5 text-ink-700 dark:text-ink-200">
						<Heart class="h-4 w-4" aria-hidden="true" />
						<span class="font-medium">{formatNumber(post.likeCount)}</span>
					</div>
				{/if}

				{#if post.repostCount !== undefined}
					<div class="flex items-center gap-1.5 text-ink-700 dark:text-ink-200">
						<Repeat2 class="h-4 w-4" aria-hidden="true" />
						<span class="font-medium">{formatNumber(post.repostCount)}</span>
					</div>
				{/if}

				{#if post.replyCount !== undefined}
					<div class="flex items-center gap-1.5 text-ink-700 dark:text-ink-200">
						<MessageCircle class="h-4 w-4" aria-hidden="true" />
						<span class="font-medium">{formatNumber(post.replyCount)}</span>
					</div>
				{/if}

				<time
					datetime={post.createdAt}
					class="ml-auto text-xs font-medium text-ink-800 dark:text-ink-100"
				>
					{formatRelativeTime(post.createdAt)}
				</time>
			</div>
		</div>
	{:else}
		<div class="rounded-xl bg-canvas-100 p-12 text-center shadow-lg dark:bg-canvas-900">
			<p class="text-ink-700 dark:text-ink-300">No posts found</p>
		</div>
	{/if}
</div>
