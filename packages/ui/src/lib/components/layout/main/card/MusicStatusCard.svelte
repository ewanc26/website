<script lang="ts">
	import Card from '../../../ui/Card.svelte';
	import type { MusicStatusData } from '@ewanc26/atproto';
	import { formatRelativeTime } from '../../../../utils/locale.js';
	import { Music, Disc3, Users, Album, Clock, Radio } from '@lucide/svelte';

	interface Props { musicStatus?: MusicStatusData | null; }
	let { musicStatus = null }: Props = $props();

	let artworkError = $state(false);

	function formatArtists(artists: { artistName: string }[]): string {
		if (!artists?.length) return 'Unknown Artist';
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
</script>

<div class="mx-auto w-full max-w-2xl">
	{#if !musicStatus}
		<Card loading={true} variant="elevated" padding="md">
			{#snippet skeleton()}
				<div class="mb-3 flex items-start gap-4">
					<div class="h-20 w-20 shrink-0 rounded-lg bg-canvas-300 dark:bg-canvas-700"></div>
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
	{:else}
		{@const s = musicStatus}
		<Card variant="elevated" padding="md">
			{#snippet children()}
				<div>
					<div class="mb-4 flex items-center gap-2">
						<Music class="h-4 w-4 text-primary-600 dark:text-primary-400" aria-hidden="true" />
						<span class="text-xs font-semibold tracking-wide text-ink-800 uppercase dark:text-ink-100">
							{s.$type === 'fm.teal.alpha.actor.status' ? 'Now Listening' : 'Last Played'}
						</span>
					</div>
					<div class="flex items-start gap-3">
						<div class="shrink-0">
							{#if s.artworkUrl && !artworkError}
								<img src={s.artworkUrl} alt="Album artwork for {s.releaseName || s.trackName}" class="h-20 w-20 rounded-lg object-cover shadow-md" loading="lazy" onerror={() => (artworkError = true)} />
							{:else}
								<div class="flex h-20 w-20 items-center justify-center rounded-lg bg-canvas-200 shadow-md dark:bg-canvas-700">
									<Disc3 class="h-10 w-10 text-ink-500 dark:text-ink-400" aria-hidden="true" />
								</div>
							{/if}
						</div>
						<div class="min-w-0 flex-1">
							<div class="mb-4">
								<a href={s.originUrl || '#'} target="_blank" rel="noopener noreferrer" class="block max-w-full text-lg font-semibold wrap-break-word whitespace-normal text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300" class:pointer-events-none={!s.originUrl} class:cursor-default={!s.originUrl}>
									{s.trackName}
								</a>
								<p class="mt-1 flex max-w-full items-start gap-1.5 text-base wrap-break-word whitespace-normal text-ink-800 dark:text-ink-100">
									<Users class="mt-0.5 h-4 w-4 shrink-0 text-ink-600 dark:text-ink-300" />
									{formatArtists(s.artists)}
								</p>
								{#if s.releaseName}
									<p class="mt-1 flex max-w-full items-start gap-1.5 text-sm wrap-break-word whitespace-normal text-ink-700 dark:text-ink-200">
										<Album class="mt-0.5 h-4 w-4 shrink-0 text-ink-500 dark:text-ink-400" />
										<span>{s.releaseName}{#if s.duration}<span class="ml-1 inline-flex items-center gap-1 text-ink-600 dark:text-ink-300">· <Clock class="h-3 w-3" />{formatDuration(s.duration)}</span>{/if}</span>
									</p>
								{/if}
							</div>
							<div class="flex items-center gap-2 text-xs text-ink-700 dark:text-ink-200">
								<time datetime={s.playedTime}>{formatRelativeTime(s.playedTime)}</time>
								{#if s.musicServiceBaseDomain}
									<span class="text-ink-600 dark:text-ink-300">·</span>
									<a href="https://teal.fm" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 transition-colors hover:text-primary-600 dark:hover:text-primary-400" title="Powered by teal.fm">
										<Radio class="h-3 w-3" />
										{formatServiceName(s.musicServiceBaseDomain)} via {s.submissionClientAgent}
									</a>
								{/if}
							</div>
						</div>
					</div>
				</div>
			{/snippet}
		</Card>
	{/if}
</div>
