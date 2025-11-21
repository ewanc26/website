<script lang="ts">
	import { onMount } from 'svelte';
	import { Card } from '$lib/components/ui';
	import { fetchMusicStatus, type MusicStatusData } from '$lib/services/atproto';
	import { formatRelativeTime } from '$lib/utils/formatDate';

	// Icons
	import { Music, Disc3, Users, Album, Clock, Radio } from '@lucide/svelte';

	let musicStatus: MusicStatusData | null = null;
	let loading = true;
	let error: string | null = null;
	let artworkError = false;

	onMount(async () => {
		try {
			musicStatus = await fetchMusicStatus();
			if (musicStatus) {
				console.log('[MusicStatusCard] Music status loaded:', musicStatus);
				console.log('[MusicStatusCard] Artwork URL:', musicStatus.artworkUrl);
				console.log('[MusicStatusCard] Release MBID:', musicStatus.releaseMbId);
			}
		} catch (err) {
			console.error('[MusicStatusCard] Error loading music status:', err);
			error = err instanceof Error ? err.message : 'Failed to load music status';
		} finally {
			loading = false;
		}
	});

	function formatArtists(artists: { artistName: string }[]): string {
		if (!artists || artists.length === 0) return 'Unknown Artist';
		return artists.map((a) => a.artistName).join(', ');
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

	function handleImageError() {
		console.error('[MusicStatusCard] Artwork failed to load');
		artworkError = true;
	}
</script>

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
					<!-- Artwork -->
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
							<div
								class="flex h-20 w-20 items-center justify-center rounded-lg bg-canvas-200 shadow-md dark:bg-canvas-700"
							>
								<Disc3 class="h-10 w-10 text-ink-500 dark:text-ink-400" aria-hidden="true" />
							</div>
						{/if}
					</div>

					<!-- Info -->
					<div class="min-w-0 flex-1">
						<!-- Header (Now Listening / Last Played) -->
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

						<!-- Content -->
						<div class="mb-2">
							<!-- Track Name -->
							<a
								href={safeMusicStatus.originUrl || '#'}
								target="_blank"
								rel="noopener noreferrer"
								class="block max-w-full text-lg font-semibold wrap-break-word whitespace-normal text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
								class:pointer-events-none={!safeMusicStatus.originUrl}
								class:cursor-default={!safeMusicStatus.originUrl}
								class:opacity-70={!safeMusicStatus.originUrl}
							>
								{safeMusicStatus.trackName}
							</a>

							<!-- Artists -->
							<p
								class="mt-1 flex max-w-full items-start gap-1.5 text-base wrap-break-word whitespace-normal text-ink-800 dark:text-ink-100"
							>
								<Users class="mt-0.5 h-4 w-4 flex-shrink-0 text-ink-600 dark:text-ink-300" />
								{formatArtists(safeMusicStatus.artists)}
							</p>

							<!-- Album + Duration -->
							{#if safeMusicStatus.releaseName}
								<p
									class="mt-1 flex max-w-full items-start gap-1.5 text-sm wrap-break-word whitespace-normal text-ink-700 dark:text-ink-200"
								>
									<Album class="mt-0.5 h-4 w-4 flex-shrink-0 text-ink-500 dark:text-ink-400" />
									<span>
										{safeMusicStatus.releaseName}

										{#if safeMusicStatus.duration}
											<span
												class="ml-1 inline-flex items-center gap-1 text-ink-600 dark:text-ink-300"
											>
												· <Clock class="h-3 w-3" />
												{formatDuration(safeMusicStatus.duration)}
											</span>
										{/if}
									</span>
								</p>
							{/if}
						</div>

						<!-- Footer / Meta -->
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
									class="inline-flex items-center gap-1 transition-colors hover:text-primary-600 dark:hover:text-primary-400"
									title="Powered by teal.fm"
								>
									<Radio class="h-3 w-3" />
									{formatServiceName(safeMusicStatus.musicServiceBaseDomain)} via {safeMusicStatus.submissionClientAgent}
								</a>
							{/if}
						</div>
					</div>
				</div>
			{/snippet}
		</Card>
	{/if}
</div>
