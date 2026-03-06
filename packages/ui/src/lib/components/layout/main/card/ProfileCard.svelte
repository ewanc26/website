<script lang="ts">
	import Card from '../../../ui/Card.svelte';
	import type { ProfileData } from '@ewanc26/atproto';
	import LinkCard from './LinkCard.svelte';
	import { formatCompactNumber } from '../../../../utils/formatNumber.js';

	interface Props { profile?: ProfileData | null; }
	let { profile = null }: Props = $props();

	let imageLoaded = $state(false);
	let bannerLoaded = $state(false);
	const locale = typeof navigator !== 'undefined' ? navigator.language || 'en-GB' : 'en-GB';
</script>

<div class="mx-auto w-full max-w-2xl">
	{#if !profile}
		<Card loading={true} variant="elevated" padding="none" class="overflow-hidden">
			{#snippet skeleton()}
				<div class="h-32 w-full rounded-t-xl bg-canvas-300 dark:bg-canvas-700"></div>
				<div class="relative -mt-16 flex justify-center sm:ml-6 sm:justify-start">
					<div class="h-32 w-32 rounded-full border-4 border-white bg-canvas-300 dark:border-canvas-900 dark:bg-canvas-700"></div>
				</div>
				<div class="space-y-2 p-6 pt-2 sm:pt-4">
					<div class="h-6 w-1/2 rounded bg-canvas-300 dark:bg-canvas-700"></div>
					<div class="h-4 w-1/3 rounded bg-canvas-300 dark:bg-canvas-700"></div>
					<div class="h-4 rounded bg-canvas-300 dark:bg-canvas-700"></div>
					<div class="h-4 w-5/6 rounded bg-canvas-300 dark:bg-canvas-700"></div>
				</div>
			{/snippet}
		</Card>
	{:else}
		{@const p = profile}
		<Card variant="elevated" padding="none" ariaLabel="Profile information">
			{#snippet children()}
				<div class="relative h-32 w-full overflow-hidden rounded-t-xl">
					{#if p.banner}
						<img src={p.banner} alt="" class="h-full w-full object-cover opacity-0 transition-opacity duration-300" class:opacity-100={bannerLoaded} onload={() => (bannerLoaded = true)} loading="lazy" role="presentation" />
					{:else}
						<div class="h-full w-full bg-linear-to-r from-primary-400 to-secondary-400" role="presentation"></div>
					{/if}
				</div>
				<div class="relative -mt-16 flex justify-center sm:ml-6 sm:justify-start">
					<div class="h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-canvas-200 dark:border-canvas-900">
						{#if p.avatar}
							<img src={p.avatar} alt="{p.displayName || p.handle}'s profile picture" class="h-full w-full object-cover opacity-0 transition-opacity duration-300" class:opacity-100={imageLoaded} onload={() => (imageLoaded = true)} loading="lazy" />
						{:else}
							<div class="flex h-full w-full items-center justify-center bg-primary-200 text-3xl font-bold text-primary-800 dark:bg-primary-800 dark:text-primary-200" role="img" aria-label="{p.displayName || p.handle}'s avatar initials">
								{(p.displayName || p.handle).charAt(0).toUpperCase()}
							</div>
						{/if}
					</div>
				</div>
				<div class="p-6">
					<h2 class="text-2xl font-bold text-ink-900 dark:text-ink-50">{p.displayName || p.handle}</h2>
					<p class="font-medium text-ink-700 dark:text-ink-200">@{p.handle}</p>
					{#if p.pronouns}<p class="text-sm text-ink-600 italic dark:text-ink-300">{p.pronouns}</p>{/if}
					{#if p.description}<p class="wrap-break-words mb-4 break-all whitespace-pre-wrap text-ink-700 dark:text-ink-200">{p.description}</p>{/if}
					<div class="flex gap-6 text-sm font-medium" role="list" aria-label="Profile statistics">
						<div class="flex items-center gap-1" role="listitem"><span class="font-bold text-ink-900 dark:text-ink-50">{formatCompactNumber(p.postsCount, locale)}</span><span class="text-ink-700 dark:text-ink-200">Posts</span></div>
						<div class="flex items-center gap-1" role="listitem"><span class="font-bold text-ink-900 dark:text-ink-50">{formatCompactNumber(p.followersCount, locale)}</span><span class="text-ink-700 dark:text-ink-200">Followers</span></div>
						<div class="flex items-center gap-1" role="listitem"><span class="font-bold text-ink-900 dark:text-ink-50">{formatCompactNumber(p.followsCount, locale)}</span><span class="text-ink-700 dark:text-ink-200">Following</span></div>
					</div>
					<div class="mt-4">
						<LinkCard url="https://witchsky.app/profile/{p.did}" title="View on Bluesky" variant="button" />
					</div>
				</div>
			{/snippet}
		</Card>
	{/if}
</div>
