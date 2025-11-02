<script lang="ts">
	import { Card } from '$lib/components/ui';
	import { fetchLatestBlueskyPost, type BlueskyPost } from '$lib/services/atproto';
	import { formatRelativeTime } from '$lib/utils/formatDate';
	import { formatCompactNumber } from '$lib/utils/formatNumber';
	import { Heart, Repeat2, MessageCircle, ExternalLink, X } from '@lucide/svelte';
	import Hls from 'hls.js';

	let post = $state<BlueskyPost | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let lightboxImage = $state<{ url: string; alt: string } | null>(null);
	let videoElements = new Map<string, { element: HTMLVideoElement; hls: Hls | null }>();

	// Detect system locale, fallback to en-GB
	const locale = typeof navigator !== 'undefined' ? navigator.language || 'en-GB' : 'en-GB';

	// Poll interval in milliseconds (2 minutes)
	const POLL_INTERVAL = 2 * 60 * 1000;

	async function loadPost() {
		try {
			const newPost = await fetchLatestBlueskyPost();
			if (newPost && (!post || newPost.uri !== post.uri)) {
				// New post detected
				post = newPost;
				console.log('[BlueskyPostCard] New post detected:', newPost.uri);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load latest post';
			console.error('[BlueskyPostCard] Error loading post:', err);
		} finally {
			loading = false;
		}
	}

	// Initial load and polling setup using $effect
	$effect(() => {
		// Initial load
		loadPost();

		// Set up polling for new posts
		const pollInterval = setInterval(async () => {
			console.log('[BlueskyPostCard] Polling for new posts...');
			await loadPost();
		}, POLL_INTERVAL);

		// Cleanup function
		return () => {
			clearInterval(pollInterval);
			// Clean up all HLS instances
			videoElements.forEach(({ hls }) => {
				if (hls) {
					hls.destroy();
				}
			});
			videoElements.clear();
		};
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

	function setupVideo(videoElement: HTMLVideoElement, videoUrl: string) {
		if (!videoElement || !videoUrl) return;

		// Clean up existing HLS instance for this video
		const existing = videoElements.get(videoUrl);
		if (existing?.hls) {
			existing.hls.destroy();
		}

		let hls: Hls | null = null;

		// Check if HLS is supported
		if (videoUrl.includes('.m3u8')) {
			if (Hls.isSupported()) {
				hls = new Hls({
					enableSoftwareAES: true,
					maxBufferLength: 30,
					maxMaxBufferLength: 600
				});
				hls.loadSource(videoUrl);
				hls.attachMedia(videoElement);
				hls.on(Hls.Events.MANIFEST_PARSED, () => {
					console.log('[HLS] Video ready to play');
				});
				hls.on(Hls.Events.ERROR, (event, data) => {
					if (data.fatal) {
						console.error('[HLS] Fatal error:', data);
					}
				});
				videoElements.set(videoUrl, { element: videoElement, hls });
			} else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
				// Native HLS support (Safari)
				videoElement.src = videoUrl;
				videoElements.set(videoUrl, { element: videoElement, hls: null });
			}
		} else {
			// Regular video file
			videoElement.src = videoUrl;
			videoElements.set(videoUrl, { element: videoElement, hls: null });
		}

		return {
			destroy() {
				if (hls) {
					hls.destroy();
				}
				videoElements.delete(videoUrl);
			}
		};
	}
</script>

{#snippet postContent(postData: BlueskyPost, depth: number = 0, isReplyParent: boolean = false)}
	<div>
		<!-- Author Info -->
		<div class="flex gap-{isReplyParent ? '2' : '3 sm:gap-3'} relative">
			{#if isReplyParent}
				<a
					href={getProfileUrl(postData.author.handle)}
					target="_blank"
					rel="noopener noreferrer"
					class="transition-opacity hover:opacity-80 shrink-0"
				>
					{#if postData.author.avatar}
						<img
							src={postData.author.avatar}
							alt={postData.author.displayName || postData.author.handle}
							class="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover"
							loading="lazy"
						/>
					{:else}
						<div
							class="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary-200 dark:bg-primary-800"
						>
							<span class="text-sm sm:text-base font-semibold text-primary-700 dark:text-primary-300">
								{(postData.author.displayName || postData.author.handle).charAt(0).toUpperCase()}
							</span>
						</div>
					{/if}
				</a>
			{:else}
				<a
					href={getProfileUrl(postData.author.handle)}
					target="_blank"
					rel="noopener noreferrer"
					class="transition-opacity hover:opacity-80 shrink-0"
				>
					{#if postData.author.avatar}
						<img
							src={postData.author.avatar}
							alt={postData.author.displayName || postData.author.handle}
							class="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover"
							loading="lazy"
						/>
					{:else}
						<div
							class="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary-200 dark:bg-primary-800"
						>
							<span class="text-base sm:text-lg font-semibold text-primary-700 dark:text-primary-300">
								{(postData.author.displayName || postData.author.handle).charAt(0).toUpperCase()}
							</span>
						</div>
					{/if}
				</a>
			{/if}
			<div class="flex-1 min-w-0">
				<!-- Author name and handle -->
				<a
					href={getProfileUrl(postData.author.handle)}
					target="_blank"
					rel="noopener noreferrer"
					class="inline-block {isReplyParent ? 'mb-1' : 'mb-2'} transition-opacity hover:opacity-80"
				>
					<div class="flex flex-col">
						<span class="text-{isReplyParent ? 'sm' : 'base'} font-semibold text-ink-900 dark:text-ink-50 leading-tight">
							{postData.author.displayName || postData.author.handle}
						</span>
						<span class="text-xs text-ink-600 dark:text-ink-400 leading-tight">
							@{postData.author.handle}
						</span>
					</div>
				</a>

				<!-- Post Text with Rich Text Support -->
				<div
					class="{isReplyParent ? 'mb-2' : 'mb-3'} overflow-wrap-anywhere break-words whitespace-pre-wrap text-{isReplyParent
						? 'sm'
						: 'base'} leading-relaxed text-ink-900 dark:text-ink-50"
				>
					{@html renderRichText(postData.text, postData.facets)}
				</div>

				<!-- Video -->
				{#if postData.hasVideo && postData.videoUrl}
					<div class="{isReplyParent ? 'mb-2' : 'mb-3'} max-w-full overflow-hidden rounded-xl bg-black border border-canvas-300 dark:border-canvas-700">
						<video
							use:setupVideo={postData.videoUrl}
							controls
							class="w-full max-w-full"
							preload="metadata"
							poster={postData.videoThumbnail}
							playsinline
						>
							<track kind="captions" />
							Your browser does not support the video tag.
						</video>
					</div>
				{/if}

				<!-- Images -->
				{#if postData.hasImages && postData.imageUrls && postData.imageUrls.length > 0}
					<div
						class="{isReplyParent ? 'mb-2' : 'mb-3'} grid max-w-full gap-1 {postData.imageUrls.length === 1
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
							class="h-auto w-full max-w-full overflow-hidden rounded-lg transition-opacity hover:opacity-90 focus:ring-2 focus:ring-primary-500 focus:outline-none dark:focus:ring-primary-400 border border-canvas-300 dark:border-canvas-700"
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
							: isReplyParent
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
						class="{isReplyParent ? 'mb-2' : 'mb-3'} flex max-w-full flex-col overflow-hidden rounded-xl border border-canvas-300 bg-canvas-200 transition-colors hover:bg-canvas-300 dark:border-canvas-700 dark:bg-canvas-800 dark:hover:bg-canvas-700"
					>
						{#if postData.externalLink.thumb}
							<img
								src={postData.externalLink.thumb}
								alt={postData.externalLink.title}
								class="h-48 w-full max-w-full object-cover"
								loading="lazy"
							/>
						{/if}
						<div class="p-3">
							<h3
								class="mb-1 overflow-wrap-anywhere break-words text-sm font-semibold text-ink-900 dark:text-ink-50 line-clamp-2"
							>
								{postData.externalLink.title}
							</h3>
							{#if postData.externalLink.description}
								<p
									class="mb-2 overflow-wrap-anywhere break-words text-xs text-ink-700 dark:text-ink-300 line-clamp-2"
								>
									{postData.externalLink.description}
								</p>
							{/if}
							<p class="overflow-wrap-anywhere break-words text-xs text-ink-600 dark:text-ink-400">
								{new URL(postData.externalLink.uri).hostname}
							</p>
						</div>
					</a>
				{/if}

				<!-- Recursively render quoted post -->
				{#if postData.quotedPost && depth < 3}
					<div class="{isReplyParent ? 'mb-2' : 'mb-3'} rounded-xl border border-canvas-300 bg-canvas-200 p-3 dark:border-canvas-700 dark:bg-canvas-800">
						{@render postContent(postData.quotedPost, depth + 1, depth === 0)}
					</div>
				{/if}

				<!-- Engagement Stats (only for non-reply-parent posts) -->
				{#if !isReplyParent}
					<div class="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm pt-1">
						{#if postData.replyCount !== undefined}
							<div class="flex items-center gap-1 sm:gap-1.5 text-ink-600 dark:text-ink-400">
								<MessageCircle class="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
								<span class="font-medium">{formatCompactNumber(postData.replyCount, locale)}</span>
							</div>
						{/if}

						{#if postData.repostCount !== undefined}
							<div class="flex items-center gap-1 sm:gap-1.5 text-ink-600 dark:text-ink-400">
								<Repeat2 class="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
								<span class="font-medium">{formatCompactNumber(postData.repostCount, locale)}</span>
							</div>
						{/if}

						{#if postData.likeCount !== undefined}
							<div class="flex items-center gap-1 sm:gap-1.5 text-ink-600 dark:text-ink-400">
								<Heart class="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
								<span class="font-medium">{formatCompactNumber(postData.likeCount, locale)}</span>
							</div>
						{/if}

						<time
							datetime={postData.createdAt}
							class="ml-auto text-xs font-medium text-ink-700 dark:text-ink-300"
						>
							{formatRelativeTime(postData.createdAt)}
						</time>
					</div>
				{/if}
			</div>
		</div>
	</div>
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
		<article class="rounded-xl bg-canvas-100 p-4 sm:p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-canvas-900">
			<!-- Header -->
			<div class="mb-3 sm:mb-4 flex items-start sm:items-center justify-between gap-2">
				<div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
					<span class="text-xs font-semibold tracking-wide text-ink-700 uppercase dark:text-ink-300 whitespace-nowrap">
						Latest Bluesky Post
					</span>
					{#if post.isRepost && post.repostAuthor}
						<span class="hidden sm:inline text-xs text-ink-600 dark:text-ink-400">·</span>
						<div class="flex items-center gap-1.5 text-xs text-ink-600 dark:text-ink-400">
							<Repeat2 class="h-3 w-3 shrink-0" aria-hidden="true" />
							<a
								href={getProfileUrl(post.repostAuthor.handle)}
								target="_blank"
								rel="noopener noreferrer"
								class="font-medium text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 truncate"
							>
								{post.repostAuthor.displayName || post.repostAuthor.handle}
							</a>
							<span class="whitespace-nowrap">reposted</span>
						</div>
					{:else if post.replyParent}
						<span class="hidden sm:inline text-xs text-ink-600 dark:text-ink-400">·</span>
						<div class="flex items-center gap-1.5 text-xs text-ink-600 dark:text-ink-400">
							<MessageCircle class="h-3 w-3 shrink-0" aria-hidden="true" />
							<span class="whitespace-nowrap">Replying to</span>
							<a
								href={getProfileUrl(post.replyParent.author.handle)}
								target="_blank"
								rel="noopener noreferrer"
								class="font-medium text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 truncate"
							>
								@{post.replyParent.author.handle}
							</a>
						</div>
					{/if}
				</div>
				<a
					href={getPostUrl(post.uri)}
					target="_blank"
					rel="noopener noreferrer"
					class="text-ink-600 transition-colors hover:text-primary-600 dark:text-ink-400 dark:hover:text-primary-400 shrink-0"
					aria-label="View post on Bluesky"
				>
					<ExternalLink class="h-4 w-4" aria-hidden="true" />
				</a>
			</div>

			<!-- Reply Context -->
			{#if post.replyParent}
				<div class="mb-3 sm:mb-4 rounded-xl border border-canvas-300 bg-canvas-200 p-2.5 sm:p-3 dark:border-canvas-700 dark:bg-canvas-800">
					{@render postContent(post.replyParent, 0, true)}
				</div>
			{/if}

			<!-- Main Post -->
			{@render postContent(post, 0, false)}
		</article>
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
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 sm:p-4"
		onclick={closeLightbox}
		onkeydown={(e) => e.key === 'Escape' && closeLightbox()}
		role="button"
		tabindex="0"
		aria-label="Close image lightbox"
	>
		<button
			type="button"
			onclick={closeLightbox}
			class="absolute top-2 right-2 sm:top-4 sm:right-4 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70 focus:ring-2 focus:ring-white focus:outline-none z-10"
			aria-label="Close"
		>
			<X class="h-5 w-5 sm:h-6 sm:w-6" />
		</button>
		<div class="relative flex max-h-[90vh] w-full max-w-[95vw] sm:max-w-[90vw] flex-col items-center">
			<img
				src={lightboxImage.url}
				alt={lightboxImage.alt}
				title={lightboxImage.alt}
				class="max-h-[75vh] sm:max-h-[80vh] w-full object-contain"
				loading="lazy"
			/>
			{#if lightboxImage.alt && lightboxImage.alt !== `Post attachment ${lightboxImage.url.split('/').pop()}`}
				<div class="mt-2 sm:mt-4 w-full max-w-full overflow-y-auto rounded-lg bg-black/70 px-3 py-2 sm:px-4 text-center text-xs sm:text-sm text-white" style="max-height: calc(15vh - 1rem); sm:max-height: calc(10vh - 2rem);">
					{lightboxImage.alt}
				</div>
			{/if}
		</div>
	</div>
{/if}
