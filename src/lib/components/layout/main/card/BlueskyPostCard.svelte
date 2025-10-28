<script lang="ts">
	import { onMount } from 'svelte';
	import { Card } from '$lib/components/ui';
	import { fetchLatestBlueskyPost, type BlueskyPost } from '$lib/services/atproto';
	import { formatRelativeTime } from '$lib/utils/formatDate';
	import { formatCompactNumber } from '$lib/utils/formatNumber';
	import { Heart, Repeat2, MessageCircle, ExternalLink, X } from '@lucide/svelte';

	let post: BlueskyPost | null = null;
	let loading = true;
	let error: string | null = null;
	let lightboxImage: { url: string; alt: string } | null = null;

	// Detect system locale, fallback to en-GB
	const locale = typeof navigator !== 'undefined' ? navigator.language || 'en-GB' : 'en-GB';

	onMount(async () => {
		try {
			post = await fetchLatestBlueskyPost();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load latest post';
		} finally {
			loading = false;
		}
	});

	function getPostUrl(uri: string): string {
		const parts = uri.split('/');
		const did = parts[2];
		const rkey = parts[4];
		return `https://bsky.app/profile/${did}/post/${rkey}`;
	}

	function getProfileUrl(handle: string): string {
		return `https://bsky.app/profile/${handle}`;
	}

	function openLightbox(url: string, alt: string) {
		lightboxImage = { url, alt };
		document.body.style.overflow = 'hidden';
	}

	function closeLightbox() {
		lightboxImage = null;
		document.body.style.overflow = '';
	}

	function renderRichText(text: string, facets?: any[]): string {
		if (!facets || facets.length === 0) return escapeHtml(text);
		const sortedFacets = [...facets].sort((a, b) => a.index.byteStart - b.index.byteStart);

		let result = '';
		let lastIndex = 0;

		for (const facet of sortedFacets) {
			const { byteStart, byteEnd } = facet.index;
			result += escapeHtml(text.slice(lastIndex, byteStart));
			const facetText = text.slice(byteStart, byteEnd);
			const feature = facet.features?.[0];

			if (feature) {
				if (feature.$type === 'app.bsky.richtext.facet#link') {
					result += `<a href="${escapeHtml(feature.uri)}" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline">${escapeHtml(facetText)}</a>`;
				} else if (feature.$type === 'app.bsky.richtext.facet#mention') {
					result += `<a href="https://bsky.app/profile/${escapeHtml(feature.did)}" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium">${escapeHtml(facetText)}</a>`;
				} else if (feature.$type === 'app.bsky.richtext.facet#tag') {
					result += `<a href="https://bsky.app/hashtag/${escapeHtml(feature.tag)}" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium">${escapeHtml(facetText)}</a>`;
				} else {
					result += escapeHtml(facetText);
				}
			} else {
				result += escapeHtml(facetText);
			}

			lastIndex = byteEnd;
		}

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
		class="rounded-xl bg-canvas-{isQuoted ? '200' : '100'} p-{isQuoted ? '4' : '6'} {isQuoted
			? 'border border-canvas-300 dark:border-canvas-700'
			: 'shadow-lg'} transition-all duration-300 {isQuoted
			? ''
			: 'hover:shadow-xl'} dark:bg-canvas-{isQuoted ? '800' : '900'}"
	>
		<!-- Header (only show on root post) -->
		{#if !isQuoted}
			<div class="mb-4 flex items-center justify-between">
				<span class="text-xs font-semibold tracking-wide text-ink-800 uppercase dark:text-ink-100">
					Latest Bluesky Post
				</span>
				<a
					href={getPostUrl(postData.uri)}
					target="_blank"
					rel="noopener noreferrer"
					class="text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
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
			class="mb-{isQuoted ? '3' : '4'} flex items-center gap-{isQuoted
				? '2'
				: '3'} transition-opacity hover:opacity-80"
		>
			{#if postData.author.avatar}
				<img
					src={postData.author.avatar}
					alt={postData.author.displayName || postData.author.handle}
					class="h-{isQuoted ? '10' : '12'} w-{isQuoted ? '10' : '12'} rounded-full object-cover"
					loading="lazy"
				/>
			{:else}
				<div
					class="flex h-{isQuoted ? '10' : '12'} w-{isQuoted
						? '10'
						: '12'} items-center justify-center rounded-full bg-primary-200 dark:bg-primary-800"
				>
					<span
						class="text-{isQuoted ? 'base' : 'lg'} font-semibold text-primary-700 dark:text-primary-300"
					>
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
		<div
			class="mb-{isQuoted ? '3' : '4'} overflow-wrap-anywhere break-words whitespace-pre-wrap text-{isQuoted
				? 'base'
				: 'lg'} leading-relaxed text-ink-900 dark:text-ink-50"
		>
			{@html renderRichText(postData.text, postData.facets)}
		</div>

		<!-- Video -->
		{#if postData.hasVideo && postData.videoUrl}
			<div class="mb-{isQuoted ? '3' : '4'} max-w-full overflow-hidden rounded-lg">
				<video
					src={postData.videoUrl}
					controls
					class="w-full max-w-full"
					preload="metadata"
					poster={postData.videoThumbnail}
				>
					<track kind="captions" />
				</video>
			</div>
		{/if}

		<!-- Images -->
		{#if postData.hasImages && postData.imageUrls && postData.imageUrls.length > 0}
			<div
				class="mb-{isQuoted ? '3' : '4'} grid max-w-full gap-2 {postData.imageUrls.length === 1
					? 'grid-cols-1'
					: postData.imageUrls.length === 2
						? 'grid-cols-2'
						: postData.imageUrls.length === 3
							? 'grid-cols-3'
							: 'grid-cols-2'}"
			>
				{#each postData.imageUrls as imageUrl, index}
					<button
					type="button"
					onclick={() =>
					openLightbox(imageUrl, postData.imageAlts?.[index] || `Post attachment ${index + 1}`)}
					class="h-auto w-full max-w-full overflow-hidden rounded-lg transition-opacity hover:opacity-90 focus:ring-2 focus:ring-primary-500 focus:outline-none dark:focus:ring-primary-400"
					 title={postData.imageAlts?.[index] || `Post attachment ${index + 1}`}
					>
					<img
					src={imageUrl}
					alt={postData.imageAlts?.[index] || `Post attachment ${index + 1}`}
					title={postData.imageAlts?.[index] || `Post attachment ${index + 1}`}
					class="h-auto w-full max-w-full object-cover {postData.imageUrls.length === 4
					? 'aspect-square'
					: postData.imageUrls.length > 1
					? 'aspect-video'
					: isQuoted
					   ? 'max-h-64'
					    : 'max-h-96'}"
					  loading="lazy"
					/>
				</button>
				{/each}
			</div>
		{/if}

		<!-- External Link Card -->
		{#if postData.externalLink}
			<a
				href={postData.externalLink.uri}
				target="_blank"
				rel="noopener noreferrer"
				class="mb-{isQuoted
					? '3'
					: '4'} flex max-w-full flex-col gap-2 overflow-hidden rounded-lg border border-canvas-300 bg-canvas-{isQuoted
					? '300'
					: '200'} transition-colors hover:bg-canvas-{isQuoted
					? '400'
					: '300'} dark:border-canvas-700 dark:bg-canvas-{isQuoted
					? '700'
					: '800'} dark:hover:bg-canvas-{isQuoted ? '600' : '700'}"
			>
				{#if postData.externalLink.thumb}
					<img
						src={postData.externalLink.thumb}
						alt={postData.externalLink.title}
						class="h-{isQuoted ? '32' : '48'} w-full max-w-full object-cover"
						loading="lazy"
					/>
				{/if}
				<div class="p-{isQuoted ? '3' : '4'}">
					<h3
						class="mb-1 overflow-wrap-anywhere break-words text-{isQuoted
							? 'sm'
							: 'base'} line-clamp-2 font-semibold text-ink-900 dark:text-ink-50"
					>
						{postData.externalLink.title}
					</h3>
					{#if postData.externalLink.description}
						<p
							class="mb-2 overflow-wrap-anywhere break-words text-{isQuoted ? 'xs' : 'sm'} line-clamp-2 text-ink-700 dark:text-ink-200"
						>
							{postData.externalLink.description}
						</p>
					{/if}
					<p class="overflow-wrap-anywhere break-words text-xs text-ink-600 dark:text-ink-300">
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
		{#if depth === 0 || (depth === 1 && !postData.quotedPost)}
			<div class="flex items-center gap-{isQuoted ? '4' : '6'} text-{isQuoted ? 'xs' : 'sm'}">
				{#if postData.replyCount !== undefined}
					<div class="flex items-center gap-1.5 text-ink-700 dark:text-ink-200">
						<MessageCircle
							class="h-{isQuoted ? '3' : '4'} w-{isQuoted ? '3' : '4'}"
							aria-hidden="true"
						/>
						<span class="font-medium">{formatCompactNumber(postData.replyCount, locale)}</span>
					</div>
				{/if}

				{#if postData.repostCount !== undefined}
					<div class="flex items-center gap-1.5 text-ink-700 dark:text-ink-200">
						<Repeat2 class="h-{isQuoted ? '3' : '4'} w-{isQuoted ? '3' : '4'}" aria-hidden="true" />
						<span class="font-medium">{formatCompactNumber(postData.repostCount, locale)}</span>
					</div>
				{/if}

				{#if postData.likeCount !== undefined}
					<div class="flex items-center gap-1.5 text-ink-700 dark:text-ink-200">
						<Heart class="h-{isQuoted ? '3' : '4'} w-{isQuoted ? '3' : '4'}" aria-hidden="true" />
						<span class="font-medium">{formatCompactNumber(postData.likeCount, locale)}</span>
					</div>
				{/if}

				<time
					datetime={postData.createdAt}
					class="ml-auto text-xs font-medium text-ink-800 dark:text-ink-100"
				>
					{formatRelativeTime(postData.createdAt)}
				</time>
			</div>
		{/if}
	</article>
{/snippet}

<div class="mx-auto w-full max-w-2xl">
	{#if loading}
		<Card loading={true} variant="elevated" padding="md">
			{#snippet skeleton()}
				<!-- Header -->
				<div class="mb-3 flex items-center justify-between">
					<div class="h-3 w-20 rounded bg-canvas-300 dark:bg-canvas-700"></div>
					<div class="h-4 w-4 rounded bg-canvas-300 dark:bg-canvas-700"></div>
				</div>

				<!-- Author -->
				<div class="mb-3 flex items-center gap-3">
					<div class="h-12 w-12 rounded-full bg-canvas-300 dark:bg-canvas-700"></div>
					<div class="flex-1 space-y-2">
						<div class="h-4 w-32 rounded bg-canvas-300 dark:bg-canvas-700"></div>
						<div class="h-3 w-24 rounded bg-canvas-300 dark:bg-canvas-700"></div>
					</div>
				</div>

				<!-- Post content -->
				<div class="mb-3 space-y-2">
					<div class="h-4 w-full rounded bg-canvas-300 dark:bg-canvas-700"></div>
					<div class="h-4 w-5/6 rounded bg-canvas-300 dark:bg-canvas-700"></div>
					<div class="h-4 w-4/6 rounded bg-canvas-300 dark:bg-canvas-700"></div>
				</div>

				<!-- Engagement stats -->
				<div class="flex gap-4">
					<div class="h-3 w-12 rounded bg-canvas-300 dark:bg-canvas-700"></div>
					<div class="h-3 w-12 rounded bg-canvas-300 dark:bg-canvas-700"></div>
					<div class="h-3 w-12 rounded bg-canvas-300 dark:bg-canvas-700"></div>
				</div>
			{/snippet}
		</Card>
	{:else if error}
		<Card error={true} errorMessage={error} />
	{:else if post}
		{@render postContent(post, 0, false)}
	{:else}
		<Card variant="flat" padding="lg">
			{#snippet children()}
				<div class="text-center">
					<p class="text-ink-700 dark:text-ink-300">No posts found</p>
				</div>
			{/snippet}
		</Card>
	{/if}
</div>

<!-- Lightbox Modal -->
{#if lightboxImage}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
		onclick={closeLightbox}
		onkeydown={(e) => e.key === 'Escape' && closeLightbox()}
		role="button"
		tabindex="0"
		aria-label="Close image lightbox"
	>
		<button
			type="button"
			onclick={closeLightbox}
			class="absolute top-4 right-4 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70 focus:ring-2 focus:ring-white focus:outline-none"
			aria-label="Close"
		>
			<X class="h-6 w-6" />
		</button>
		<div class="relative flex max-h-[90vh] w-full max-w-[90vw] flex-col items-center">
			<img
				src={lightboxImage.url}
				alt={lightboxImage.alt}
				title={lightboxImage.alt}
				class="max-h-[80vh] w-full object-contain"
				loading="lazy"
			/>
			{#if lightboxImage.alt && lightboxImage.alt !== `Post attachment ${lightboxImage.url.split('/').pop()}`}
				<div class="mt-4 w-full max-w-full overflow-y-auto rounded-lg bg-black/70 px-4 py-2 text-center text-sm text-white" style="max-height: calc(10vh - 2rem);">
					{lightboxImage.alt}
				</div>
			{/if}
		</div>
	</div>
{/if}
