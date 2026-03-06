<script lang="ts">
	import Card from '../../../ui/Card.svelte';
	import { fetchLatestBlueskyPost, type BlueskyPost } from '@ewanc26/atproto';
	import { formatRelativeTime } from '../../../../utils/locale.js';
	import { formatCompactNumber } from '../../../../utils/formatNumber.js';
	import { Heart, Repeat2, MessageCircle, ExternalLink, X } from '@lucide/svelte';
	import Hls from 'hls.js';

	interface Props {
		did: string;
		post?: BlueskyPost | null;
	}

	let { did, post: initialPost = null }: Props = $props();

	let post = $state<BlueskyPost | null>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let lightboxImage = $state<{ url: string; alt: string } | null>(null);
	let videoElements = new Map<string, { element: HTMLVideoElement; hls: Hls | null }>();

	const locale = typeof navigator !== 'undefined' ? navigator.language || 'en-GB' : 'en-GB';
	const POLL_INTERVAL = 2 * 60 * 1000;

	async function loadPost() {
		try {
			const newPost = await fetchLatestBlueskyPost(did);
			if (newPost && (!post || newPost.uri !== post.uri)) post = newPost;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load latest post';
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		if (initialPost && !post) post = initialPost;
		if (!post) { loading = true; loadPost(); }
		const pollInterval = setInterval(() => loadPost(), POLL_INTERVAL);
		return () => {
			clearInterval(pollInterval);
			videoElements.forEach(({ hls }) => { if (hls) hls.destroy(); });
			videoElements.clear();
		};
	});

	function getPostUrl(uri: string): string {
		const parts = uri.split('/');
		return `https://witchsky.app/profile/${parts[2]}/post/${parts[4]}`;
	}

	function getProfileUrl(handle: string): string {
		return `https://witchsky.app/profile/${handle}`;
	}

	function openLightbox(url: string, alt: string) {
		lightboxImage = { url, alt };
		document.body.style.overflow = 'hidden';
	}

	function closeLightbox() {
		lightboxImage = null;
		document.body.style.overflow = '';
	}

	function escapeHtml(text: string): string {
		const div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	}

	function renderRichText(text: string, facets?: any[]): string {
		if (!facets?.length) return escapeHtml(text);
		const sortedFacets = [...facets].sort((a, b) => a.index.byteStart - b.index.byteStart);
		const encoder = new TextEncoder();
		const decoder = new TextDecoder();
		const bytes = encoder.encode(text);
		let result = '';
		let lastByteIndex = 0;
		for (const facet of sortedFacets) {
			const { byteStart, byteEnd } = facet.index;
			if (lastByteIndex < byteStart) result += escapeHtml(decoder.decode(bytes.slice(lastByteIndex, byteStart)));
			const facetText = decoder.decode(bytes.slice(byteStart, byteEnd));
			const feature = facet.features?.[0];
			if (feature) {
				if (feature.$type === 'app.bsky.richtext.facet#link') {
					result += `<a href="${escapeHtml(feature.uri)}" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline">${escapeHtml(facetText)}</a>`;
				} else if (feature.$type === 'app.bsky.richtext.facet#mention') {
					result += `<a href="https://witchsky.app/profile/${escapeHtml(feature.did)}" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium">${escapeHtml(facetText)}</a>`;
				} else if (feature.$type === 'app.bsky.richtext.facet#tag') {
					result += `<a href="https://witchsky.app/hashtag/${escapeHtml(feature.tag)}" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium">${escapeHtml(facetText)}</a>`;
				} else { result += escapeHtml(facetText); }
			} else { result += escapeHtml(facetText); }
			lastByteIndex = byteEnd;
		}
		if (lastByteIndex < bytes.length) result += escapeHtml(new TextDecoder().decode(bytes.slice(lastByteIndex)));
		return result;
	}

	function setupVideo(videoElement: HTMLVideoElement, videoUrl: string) {
		if (!videoElement || !videoUrl) return;
		const existing = videoElements.get(videoUrl);
		if (existing?.hls) existing.hls.destroy();
		let hls: Hls | null = null;
		if (videoUrl.includes('.m3u8')) {
			if (Hls.isSupported()) {
				hls = new Hls({ enableSoftwareAES: true, maxBufferLength: 30, maxMaxBufferLength: 600 });
				hls.loadSource(videoUrl);
				hls.attachMedia(videoElement);
				videoElements.set(videoUrl, { element: videoElement, hls });
			} else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
				videoElement.src = videoUrl;
				videoElements.set(videoUrl, { element: videoElement, hls: null });
			}
		} else {
			videoElement.src = videoUrl;
			videoElements.set(videoUrl, { element: videoElement, hls: null });
		}
		return { destroy() { if (hls) hls.destroy(); videoElements.delete(videoUrl); } };
	}
</script>

{#snippet postContent(postData: BlueskyPost, depth: number = 0, isReplyParent: boolean = false)}
	<div>
		<div class="relative flex gap-3">
			<a href={getProfileUrl(postData.author.handle)} target="_blank" rel="noopener noreferrer" class="shrink-0 transition-opacity hover:opacity-80">
				{#if postData.author.avatar}
					<img src={postData.author.avatar} alt={postData.author.displayName || postData.author.handle} class="h-{isReplyParent ? '8' : '10'} w-{isReplyParent ? '8' : '10'} rounded-full object-cover sm:h-{isReplyParent ? '10' : '12'} sm:w-{isReplyParent ? '10' : '12'}" loading="lazy" />
				{:else}
					<div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-200 dark:bg-primary-800">
						<span class="text-base font-semibold text-primary-700 dark:text-primary-300">{(postData.author.displayName || postData.author.handle).charAt(0).toUpperCase()}</span>
					</div>
				{/if}
			</a>
			<div class="min-w-0 flex-1">
				<a href={getProfileUrl(postData.author.handle)} target="_blank" rel="noopener noreferrer" class="mb-2 inline-block transition-opacity hover:opacity-80">
					<div class="flex flex-col">
						<span class="text-base leading-tight font-semibold text-ink-900 dark:text-ink-50">{postData.author.displayName || postData.author.handle}</span>
						<span class="text-xs leading-tight text-ink-600 dark:text-ink-400">@{postData.author.handle}</span>
					</div>
				</a>
				<div class="overflow-wrap-anywhere mb-3 text-base leading-relaxed wrap-break-word whitespace-pre-wrap text-ink-900 dark:text-ink-50">
					{@html renderRichText(postData.text, postData.facets)}
				</div>
				{#if postData.hasVideo && postData.videoUrl}
					<div class="mb-3 max-w-full overflow-hidden rounded-xl border border-canvas-300 bg-black dark:border-canvas-700">
						<video use:setupVideo={postData.videoUrl} controls class="w-full max-w-full" preload="metadata" poster={postData.videoThumbnail} playsinline>
							<track kind="captions" />
						</video>
					</div>
				{/if}
				{#if postData.hasImages && postData.imageUrls?.length}
					<div class="mb-3 grid max-w-full gap-1 {postData.imageUrls.length === 1 ? 'grid-cols-1' : postData.imageUrls.length === 2 ? 'grid-cols-2' : postData.imageUrls.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}">
						{#each postData.imageUrls as imageUrl, index}
							<button type="button" onclick={() => openLightbox(imageUrl, postData.imageAlts?.[index] || `Post attachment ${index + 1}`)} class="h-auto w-full max-w-full overflow-hidden rounded-lg border border-canvas-300 transition-opacity hover:opacity-90 dark:border-canvas-700">
								<img src={imageUrl} alt={postData.imageAlts?.[index] || `Post attachment ${index + 1}`} class="h-auto w-full max-w-full object-cover {postData.imageUrls!.length > 1 ? 'aspect-video' : 'max-h-96'}" loading="lazy" />
							</button>
						{/each}
					</div>
				{/if}
				{#if postData.externalLink}
					<a href={postData.externalLink.uri} target="_blank" rel="noopener noreferrer" class="mb-3 flex max-w-full flex-col overflow-hidden rounded-xl border border-canvas-300 bg-canvas-200 transition-colors hover:bg-canvas-300 dark:border-canvas-700 dark:bg-canvas-800 dark:hover:bg-canvas-700">
						{#if postData.externalLink.thumb}<img src={postData.externalLink.thumb} alt={postData.externalLink.title} class="h-48 w-full max-w-full object-cover" loading="lazy" />{/if}
						<div class="p-3">
							<h3 class="overflow-wrap-anywhere mb-1 line-clamp-2 text-sm font-semibold wrap-break-word text-ink-900 dark:text-ink-50">{postData.externalLink.title}</h3>
							{#if postData.externalLink.description}<p class="overflow-wrap-anywhere mb-2 line-clamp-2 text-xs wrap-break-word text-ink-700 dark:text-ink-300">{postData.externalLink.description}</p>{/if}
							<p class="overflow-wrap-anywhere text-xs wrap-break-word text-ink-600 dark:text-ink-400">{new URL(postData.externalLink.uri).hostname}</p>
						</div>
					</a>
				{/if}
				{#if postData.quotedPost && depth < 3}
					<div class="mb-3 rounded-xl border border-canvas-300 bg-canvas-200 p-3 dark:border-canvas-700 dark:bg-canvas-800">
						{@render postContent(postData.quotedPost, depth + 1, depth === 0)}
					</div>
				{/if}
				{#if !isReplyParent}
					<div class="flex flex-wrap items-center gap-3 pt-1 text-xs sm:gap-6 sm:text-sm">
						{#if postData.replyCount !== undefined}<div class="flex items-center gap-1 text-ink-600 dark:text-ink-400"><MessageCircle class="h-3.5 w-3.5" aria-hidden="true" /><span class="font-medium">{formatCompactNumber(postData.replyCount, locale)}</span></div>{/if}
						{#if postData.repostCount !== undefined}<div class="flex items-center gap-1 text-ink-600 dark:text-ink-400"><Repeat2 class="h-3.5 w-3.5" aria-hidden="true" /><span class="font-medium">{formatCompactNumber(postData.repostCount, locale)}</span></div>{/if}
						{#if postData.likeCount !== undefined}<div class="flex items-center gap-1 text-ink-600 dark:text-ink-400"><Heart class="h-3.5 w-3.5" aria-hidden="true" /><span class="font-medium">{formatCompactNumber(postData.likeCount, locale)}</span></div>{/if}
						<time datetime={postData.createdAt} class="ml-auto text-xs font-medium text-ink-700 dark:text-ink-300">{formatRelativeTime(postData.createdAt)}</time>
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
				<div class="mb-3 flex items-center gap-3">
					<div class="h-12 w-12 rounded-full bg-canvas-300 dark:bg-canvas-700"></div>
					<div class="flex-1 space-y-2">
						<div class="h-4 w-32 rounded bg-canvas-300 dark:bg-canvas-700"></div>
						<div class="h-3 w-24 rounded bg-canvas-300 dark:bg-canvas-700"></div>
					</div>
				</div>
				<div class="mb-3 space-y-2">
					<div class="h-4 w-full rounded bg-canvas-300 dark:bg-canvas-700"></div>
					<div class="h-4 w-5/6 rounded bg-canvas-300 dark:bg-canvas-700"></div>
				</div>
			{/snippet}
		</Card>
	{:else if error}
		<Card error={true} errorMessage={error} />
	{:else if post}
		<article class="rounded-xl bg-canvas-100 p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-canvas-900">
			<div class="mb-4 flex items-start justify-between gap-2 sm:items-center">
				<div class="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
					<span class="text-xs font-semibold tracking-wide whitespace-nowrap text-ink-700 uppercase dark:text-ink-300">Latest Bluesky Post</span>
					{#if post.isRepost && post.repostAuthor}
						<div class="flex items-center gap-1.5 text-xs text-ink-600 dark:text-ink-400">
							<Repeat2 class="h-3 w-3 shrink-0" aria-hidden="true" />
							<a href={getProfileUrl(post.repostAuthor.handle)} target="_blank" rel="noopener noreferrer" class="truncate font-medium text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400">
								{post.repostAuthor.displayName || post.repostAuthor.handle}
							</a>
							<span class="whitespace-nowrap">reposted</span>
						</div>
					{:else if post.replyParent}
						<div class="flex items-center gap-1.5 text-xs text-ink-600 dark:text-ink-400">
							<MessageCircle class="h-3 w-3 shrink-0" aria-hidden="true" />
							<span class="whitespace-nowrap">Replying to</span>
							<a href={getProfileUrl(post.replyParent.author.handle)} target="_blank" rel="noopener noreferrer" class="truncate font-medium text-primary-600 dark:text-primary-400">@{post.replyParent.author.handle}</a>
						</div>
					{/if}
				</div>
				<a href={getPostUrl(post.uri)} target="_blank" rel="noopener noreferrer" class="shrink-0 text-ink-600 transition-colors hover:text-primary-600 dark:text-ink-400 dark:hover:text-primary-400" aria-label="View post on Bluesky">
					<ExternalLink class="h-4 w-4" aria-hidden="true" />
				</a>
			</div>
			{#if post.replyParent}
				<div class="mb-4 rounded-xl border border-canvas-300 bg-canvas-200 p-3 dark:border-canvas-700 dark:bg-canvas-800">
					{@render postContent(post.replyParent, 0, true)}
				</div>
			{/if}
			{@render postContent(post, 0, false)}
		</article>
	{:else}
		<Card variant="flat" padding="lg">
			{#snippet children()}
				<div class="text-center"><p class="text-ink-700 dark:text-ink-300">No posts found</p></div>
			{/snippet}
		</Card>
	{/if}
</div>

{#if lightboxImage}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onclick={closeLightbox} onkeydown={(e) => e.key === 'Escape' && closeLightbox()} role="button" tabindex="0" aria-label="Close image lightbox">
		<button type="button" onclick={closeLightbox} class="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70" aria-label="Close">
			<X class="h-6 w-6" />
		</button>
		<div class="relative flex max-h-[90vh] w-full max-w-[90vw] flex-col items-center">
			<img src={lightboxImage.url} alt={lightboxImage.alt} class="max-h-[80vh] w-full object-contain" loading="lazy" />
			{#if lightboxImage.alt}
				<div class="mt-4 w-full rounded-lg bg-black/70 px-4 py-2 text-center text-sm text-white">{lightboxImage.alt}</div>
			{/if}
		</div>
	</div>
{/if}
