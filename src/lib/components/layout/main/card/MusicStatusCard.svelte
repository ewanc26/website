<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { Card } from '$lib/components/ui';
	import { fetchMusicStatus, type MusicStatusData } from '$lib/services/atproto';
	import { formatRelativeTime } from '$lib/utils/formatDate';
	import { Music, Disc3 } from '@lucide/svelte';

	let musicStatus: MusicStatusData | null = null;
	let loading = true;
	let error: string | null = null;
	let artworkError = false;

	// Refs for autoscroll detection
	let trackNameEl: HTMLElement;
	let artistEl: HTMLElement;
	let albumEl: HTMLElement;

	onMount(async () => {
		try {
			musicStatus = await fetchMusicStatus();
			if (musicStatus) {
				console.log('[MusicStatusCard] Music status loaded:', musicStatus);
				console.log('[MusicStatusCard] Artwork URL:', musicStatus.artworkUrl);
				console.log('[MusicStatusCard] Release MBID:', musicStatus.releaseMbId);
				
				// Wait for DOM to update then check for overflow
				await tick();
				checkOverflow();
			}
		} catch (err) {
			console.error('[MusicStatusCard] Error loading music status:', err);
			error = err instanceof Error ? err.message : 'Failed to load music status';
		} finally {
			loading = false;
		}
	});

	function checkOverflow() {
		const elements = [trackNameEl, artistEl, albumEl].filter(Boolean);
		
		elements.forEach(el => {
			if (!el) return;
			
			const container = el.parentElement;
			if (!container) return;
			
			const isOverflowing = el.scrollWidth > container.clientWidth;
			
			if (isOverflowing) {
				const overflowAmount = el.scrollWidth - container.clientWidth;
				const duration = Math.max(8, overflowAmount / 20); // ~20px per second
				
				el.style.setProperty('--overflow-amount', `-${overflowAmount}px`);
				el.style.setProperty('--scroll-duration', `${duration}s`);
				el.classList.add('is-overflowing');
			} else {
				el.classList.remove('is-overflowing');
			}
		});
	}

	function formatArtists(artists: { artistName: string }[]): string {
		if (!artists || artists.length === 0) return 'Unknown Artist';
		return artists.map(a => a.artistName).join(', ');
	}

	function formatDuration(seconds?: number): string {
		if (!seconds) return '';
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	}

	function formatServiceName(domain?: string): string {
		if (!domain) return '';
		return domain.replace('lastfm', 'Last.fm').replace('last.fm', 'Last.fm');
	}

	function handleImageError(event: Event) {
		console.error('[MusicStatusCard] Artwork failed to load');
		artworkError = true;
	}
</script>

<style>
	.autoscroll-container {
		position: relative;
		overflow: hidden;
		width: 100%;
		max-width: 100%;
	}

	.autoscroll-text {
		display: inline-block;
		white-space: nowrap;
	}

	@keyframes autoscroll {
		0%, 10% {
			transform: translateX(0);
		}
		45%, 55% {
			transform: translateX(var(--overflow-amount, -100px));
		}
		90%, 100% {
			transform: translateX(0);
		}
	}
</style>

<div class="mx-auto w-full max-w-2xl">
	{#if loading}
		<Card loading={true} variant="elevated" padding="md">
			{#snippet skeleton()}
				<div class="mb-3 flex items-start gap-4">
					<div class="h-20 w-20 flex-shrink-0 rounded-lg bg-canvas-300 dark:bg-canvas-700"></div>
					<div class="flex-1">
						<div class="mb-2 flex items-center gap-2">
							<div class="h-4 w-4 rounded bg-canvas-300 dark:bg-canvas-700"></div>
							<div class="h-3 w-32 rounded bg-canvas-300 dark:bg-canvas-700"></div>
						</div>
						<div class="mb-1 h-5 w-3/4 rounded bg-canvas-300 dark:bg-canvas-700"></div>
						<div class="mb-2 h-4 w-1/2 rounded bg-canvas-300 dark:bg-canvas-700"></div>
						<div class="h-3 w-40 rounded bg-canvas-300 dark:bg-canvas-700"></div>
					</div>
				</div>
			{/snippet}
		</Card>
	{:else if error}
		<Card error={true} errorMessage={error} />
	{:else if musicStatus}
		{@const safeMusicStatus = musicStatus}
		<Card variant="elevated" padding="md">
			{#snippet children()}
				<div class="flex items-start gap-4">
					<!-- Artwork Section -->
					<div class="flex-shrink-0">
						{#if safeMusicStatus.artworkUrl && !artworkError}
							<img
								src={safeMusicStatus.artworkUrl}
								alt="Album artwork for {safeMusicStatus.releaseName || safeMusicStatus.trackName}"
								class="h-20 w-20 rounded-lg object-cover shadow-md"
								loading="lazy"
								onerror={handleImageError}
							/>
						{:else}
							<!-- Fallback icon when no artwork or artwork fails to load -->
							<div class="h-20 w-20 rounded-lg bg-canvas-200 dark:bg-canvas-700 flex items-center justify-center shadow-md">
								<Disc3 class="h-10 w-10 text-ink-500 dark:text-ink-400" aria-hidden="true" />
							</div>
						{/if}
					</div>

					<div class="flex-1 min-w-0">
						<div class="mb-2 flex items-center gap-2">
							<Music class="h-4 w-4 text-primary-600 dark:text-primary-400" aria-hidden="true" />
							<span
								class="text-xs font-semibold tracking-wide text-ink-800 uppercase dark:text-ink-100"
							>
								{safeMusicStatus.$type === 'fm.teal.alpha.actor.status' 
									? 'Now Listening' 
									: 'Last Played'}
							</span>
						</div>

						<div class="mb-2">
							<div class="autoscroll-container">
								<a
									bind:this={trackNameEl}
									href={safeMusicStatus.originUrl || '#'}
									target="_blank"
									rel="noopener noreferrer"
									class="autoscroll-text text-lg font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
									class:pointer-events-none={!safeMusicStatus.originUrl}
									class:cursor-default={!safeMusicStatus.originUrl}
									class:opacity-70={!safeMusicStatus.originUrl}
								>
									{safeMusicStatus.trackName}
								</a>
							</div>

							<div class="autoscroll-container">
								<p bind:this={artistEl} class="autoscroll-text text-base text-ink-800 dark:text-ink-100">
									{formatArtists(safeMusicStatus.artists)}
								</p>
							</div>

							{#if safeMusicStatus.releaseName}
								<div class="autoscroll-container">
									<p bind:this={albumEl} class="autoscroll-text text-sm text-ink-700 dark:text-ink-200">
										{safeMusicStatus.releaseName}
										{#if safeMusicStatus.duration}
											<span class="text-ink-600 dark:text-ink-300">
												· {formatDuration(safeMusicStatus.duration)}
											</span>
										{/if}
									</p>
								</div>
							{/if}
						</div>

						<div class="flex items-center gap-2 text-xs text-ink-700 dark:text-ink-200">
							<time datetime={safeMusicStatus.playedTime}>
								{formatRelativeTime(safeMusicStatus.playedTime)}
							</time>
							{#if safeMusicStatus.musicServiceBaseDomain}
								<span class="text-ink-600 dark:text-ink-300">·</span>
								<a
									href="https://teal.fm"
									target="_blank"
									rel="noopener noreferrer"
									class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
									title="Powered by teal.fm"
								>
									{formatServiceName(safeMusicStatus.musicServiceBaseDomain)} via teal.fm
								</a>
							{/if}
						</div>
					</div>
				</div>
			{/snippet}
		</Card>
	{/if}
</div>