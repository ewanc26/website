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

	function getProfileUrl(handle: string): string {
		return `https://bsky.app/profile/${handle}`;
	}

	// Render rich text with facets (links, mentions, hashtags)
	function renderRichText(text: string, facets?: any[]): string {
		if (!facets || facets.length === 0) {
			return escapeHtml(text);
		}

		// Sort facets by byteStart to process them in order
		const sortedFacets = [...facets].sort((a, b) => a.index.byteStart - b.index.byteStart);
		
		let result = '';
		let lastIndex = 0;

		for (const facet of sortedFacets) {
			const { byteStart, byteEnd } = facet.index;
			
			// Add text before this facet
			result += escapeHtml(text.slice(lastIndex, byteStart));
			
			const facetText = text.slice(byteStart, byteEnd);
			const feature = facet.features?.[0];

			if (feature) {
				if (feature.$type === 'app.bsky.richtext.facet#link') {
					result += `<a href="${escapeHtml(feature.uri)}" target="_blank" rel="noopener noreferrer" class="text-sage-600 hover:text-sage-700 dark:text-sage-400 dark:hover:text-sage-300 underline">${escapeHtml(facetText)}</a>`;
				} else if (feature.$type === 'app.bsky.richtext.facet#mention') {
					result += `<a href="https://bsky.app/profile/${escapeHtml(feature.did)}" target="_blank" rel="noopener noreferrer" class="text-sage-600 hover:text-sage-700 dark:text-sage-400 dark:hover:text-sage-300 font-medium">${escapeHtml(facetText)}</a>`;
				} else if (feature.$type === 'app.bsky.richtext.facet#tag') {
					result += `<a href="https://bsky.app/hashtag/${escapeHtml(feature.tag)}" target="_blank" rel="noopener noreferrer" class="text-sage-600 hover:text-sage-700 dark:text-sage-400 dark:hover:text-sage-300 font-medium">${escapeHtml(facetText)}</a>`;
				} else {
					result += escapeHtml(facetText);
				}
			} else {
				result += escapeHtml(facetText);
			}

			lastIndex = byteEnd;
		}

		// Add remaining text after last facet
		result += escapeHtml(text.slice(lastIndex));
		
		return result;
	}

	function escapeHtml(text: string): string {
		const div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	}
</script>

{#snippet postContent(postData: BlueskyPost, depth: number = 0, isQuoted: boolean = false)}
	<article
		class="rounded-xl bg-canvas-{isQuoted ? '200' : '100'} p-{isQuoted ? '4' : '6'} {isQuoted ? 'border border-canvas-300 dark:border-canvas-700' : 'shadow-lg'} transition-all duration-300 {isQuoted ? '' : 'hover:shadow-xl'} dark:bg-canvas-{isQuoted ? '800' : '900'}"
	>
		<!-- Header (only show on root post) -->
		{#if !isQuoted}
			<div class="mb-4 flex items-center justify-between">
				<span
					class="text-xs font-semibold uppercase tracking-wide text-ink-800 dark:text-ink-100"
				>
					Latest Post
				</span>
				<a
					href={getPostUrl(postData.uri)}
					target="_blank"
					rel="noopener noreferrer"
					class="text-sage-600 transition-colors hover:text-sage-700 dark:text-sage-400 dark:hover:text-sage-300"
					aria-label="View post on Bluesky"
				>
					<ExternalLink class="h-4 w-4" aria-hidden="true" />
				</a>
			</div>
		{/if}

		<!-- Author Info -->
		<a
			href={getProfileUrl(postData.author.handle)}
			target="_blank"
			rel="noopener noreferrer"
			class="mb-{isQuoted ? '3' : '4'} flex items-center gap-{isQuoted ? '2' : '3'} transition-opacity hover:opacity-80"
		>
			{#if postData.author.avatar}
				<img
					src={postData.author.avatar}
					alt={postData.author.displayName || postData.author.handle}
					class="h-{isQuoted ? '10' : '12'} w-{isQuoted ? '10' : '12'} rounded-full object-cover"
					loading="lazy"
				/>
			{:else}
				<div class="flex h-{isQuoted ? '10' : '12'} w-{isQuoted ? '10' : '12'} items-center justify-center rounded-full bg-sage-200 dark:bg-sage-800">
					<span class="text-{isQuoted ? 'base' : 'lg'} font-semibold text-sage-700 dark:text-sage-300">
						{(postData.author.displayName || postData.author.handle).charAt(0).toUpperCase()}
					</span>
				</div>
			{/if}
			<div class="flex flex-col">
				<span class="text-{isQuoted ? 'sm' : 'base'} font-semibold text-ink-900 dark:text-ink-50">
					{postData.author.displayName || postData.author.handle}
				</span>
				<span class="text-{isQuoted ? 'xs' : 'sm'} text-ink-700 dark:text-ink-200">
					@{postData.author.handle}
				</span>
			</div>
			{#if isQuoted}
				<ExternalLink
					class="ml-auto h-4 w-4 flex-shrink-0 text-ink-700 transition-colors dark:text-ink-200"
					aria-hidden="true"
				/>
			{/if}
		</a>

		<!-- Post Text with Rich Text Support -->
		<div class="mb-{isQuoted ? '3' : '4'} whitespace-pre-wrap text-{isQuoted ? 'base' : 'lg'} leading-relaxed text-ink-900 dark:text-ink-50">
			{@html renderRichText(postData.text, postData.facets)}
		</div>

		<!-- Video -->
		{#if postData.hasVideo && postData.videoUrl}
			<div class="mb-{isQuoted ? '3' : '4'} overflow-hidden rounded-lg">
				<video
					src={postData.videoUrl}
					controls
					class="w-full"
					preload="metadata"
					poster={postData.videoThumbnail}
				>
					<track kind="captions" />
				</video>
			</div>
		{:else if postData.hasImages && postData.imageUrls && postData.imageUrls.length > 0}
			<!-- Images -->
			<div class="mb-{isQuoted ? '3' : '4'} grid gap-2 {postData.imageUrls.length === 1 ? 'grid-cols-1' : postData.imageUrls.length === 2 ? 'grid-cols-2' : postData.imageUrls.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}">
				{#each postData.imageUrls as imageUrl, index}
					<img
						src={imageUrl}
						alt={postData.imageAlts?.[index] || `Post attachment ${index + 1}`}
						class="h-auto w-full rounded-lg object-cover {postData.imageUrls.length === 4 ? 'aspect-square' : postData.imageUrls.length > 1 ? 'aspect-video' : isQuoted ? 'max-h-64' : 'max-h-96'}"
						loading="lazy"
					/>
				{/each}
			</div>
		{/if}

		<!-- External Link Card -->
		{#if postData.externalLink}
			<a
				href={postData.externalLink.uri}
				target="_blank"
				rel="noopener noreferrer"
				class="mb-{isQuoted ? '3' : '4'} flex flex-col gap-2 overflow-hidden rounded-lg border border-canvas-300 bg-canvas-{isQuoted ? '300' : '200'} transition-colors hover:bg-canvas-{isQuoted ? '400' : '300'} dark:border-canvas-700 dark:bg-canvas-{isQuoted ? '700' : '800'} dark:hover:bg-canvas-{isQuoted ? '600' : '700'}"
			>
				{#if postData.externalLink.thumb}
					<img
						src={postData.externalLink.thumb}
						alt={postData.externalLink.title}
						class="h-{isQuoted ? '32' : '48'} w-full object-cover"
						loading="lazy"
					/>
				{/if}
				<div class="p-{isQuoted ? '3' : '4'}">
					<h3 class="mb-1 text-{isQuoted ? 'sm' : 'base'} font-semibold text-ink-900 line-clamp-2 dark:text-ink-50">
						{postData.externalLink.title}
					</h3>
					{#if postData.externalLink.description}
						<p class="mb-2 text-{isQuoted ? 'xs' : 'sm'} text-ink-700 line-clamp-2 dark:text-ink-200">
							{postData.externalLink.description}
						</p>
					{/if}
					<p class="text-xs text-ink-600 dark:text-ink-300">
						{new URL(postData.externalLink.uri).hostname}
					</p>
				</div>
			</a>
		{/if}

		<!-- Recursively render quoted post -->
		{#if postData.quotedPost && depth < 2}
			<div class="mb-{isQuoted ? '3' : '4'}">
				{@render postContent(postData.quotedPost, depth + 1, true)}
			</div>
		{/if}

		<!-- Engagement Stats -->
		<div class="flex items-center gap-{isQuoted ? '4' : '6'} text-{isQuoted ? 'xs' : 'sm'}">
			{#if postData.likeCount !== undefined}
				<div class="flex items-center gap-1.5 text-ink-700 dark:text-ink-200">
					<Heart class="h-{isQuoted ? '3' : '4'} w-{isQuoted ? '3' : '4'}" aria-hidden="true" />
					<span class="font-medium">{formatNumber(postData.likeCount)}</span>
				</div>
			{/if}

			{#if postData.repostCount !== undefined}
				<div class="flex items-center gap-1.5 text-ink-700 dark:text-ink-200">
					<Repeat2 class="h-{isQuoted ? '3' : '4'} w-{isQuoted ? '3' : '4'}" aria-hidden="true" />
					<span class="font-medium">{formatNumber(postData.repostCount)}</span>
				</div>
			{/if}

			{#if postData.replyCount !== undefined}
				<div class="flex items-center gap-1.5 text-ink-700 dark:text-ink-200">
					<MessageCircle class="h-{isQuoted ? '3' : '4'} w-{isQuoted ? '3' : '4'}" aria-hidden="true" />
					<span class="font-medium">{formatNumber(postData.replyCount)}</span>
				</div>
			{/if}

			<time
				datetime={postData.createdAt}
				class="ml-auto text-xs font-medium text-ink-800 dark:text-ink-100"
			>
				{formatRelativeTime(postData.createdAt)}
			</time>
		</div>
	</article>
{/snippet}

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
		{@render postContent(post, 0, false)}
	{:else}
		<div class="rounded-xl bg-canvas-100 p-12 text-center shadow-lg dark:bg-canvas-900">
			<p class="text-ink-700 dark:text-ink-300">No posts found</p>
		</div>
	{/if}
</div>
