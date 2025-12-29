<script lang="ts">
	import { onMount } from 'svelte';
	import { Card } from '$lib/components/ui';
	import { fetchProfile, type ProfileData } from '$lib/services/atproto';
	import LinkCard from './LinkCard.svelte';
	import { formatCompactNumber } from '$lib/utils/formatNumber';

	let profile: ProfileData | null = null;
	let loading = true;
	let error: string | null = null;
	let imageLoaded = false;
	let bannerLoaded = false;

	// Detect system locale, fallback to en-GB
	const locale = typeof navigator !== 'undefined' ? navigator.language || 'en-GB' : 'en-GB';

	onMount(async () => {
		try {
			profile = await fetchProfile();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load profile';
		} finally {
			loading = false;
		}
	});
</script>

<div class="mx-auto w-full max-w-2xl">
	{#if loading}
		<Card loading={true} variant="elevated" padding="none" class="overflow-hidden">
			{#snippet skeleton()}
				<!-- Banner skeleton -->
				<div class="h-32 w-full rounded-t-xl bg-canvas-300 dark:bg-canvas-700"></div>

				<!-- Avatar skeleton -->
				<div class="relative -mt-16 flex justify-center sm:ml-6 sm:justify-start">
					<div
						class="h-32 w-32 rounded-full border-4 border-white bg-canvas-300 dark:border-canvas-900 dark:bg-canvas-700"
					></div>
				</div>

				<!-- Profile content skeleton -->
				<div class="space-y-2 p-6 pt-2 sm:pt-4">
					<div class="h-6 w-1/2 rounded bg-canvas-300 dark:bg-canvas-700"></div>
					<div class="h-4 w-1/3 rounded bg-canvas-300 dark:bg-canvas-700"></div>
					<div class="h-4 rounded bg-canvas-300 dark:bg-canvas-700"></div>
					<div class="h-4 w-5/6 rounded bg-canvas-300 dark:bg-canvas-700"></div>
					<div class="mt-4 flex gap-6">
						<div class="h-4 w-16 rounded bg-canvas-300 dark:bg-canvas-700"></div>
						<div class="h-4 w-20 rounded bg-canvas-300 dark:bg-canvas-700"></div>
						<div class="h-4 w-20 rounded bg-canvas-300 dark:bg-canvas-700"></div>
					</div>
					<div class="mt-4 h-10 w-36 rounded bg-canvas-300 dark:bg-canvas-700"></div>
				</div>
			{/snippet}
		</Card>
	{:else if error}
		<Card error={true} errorMessage={error} />
	{:else if profile}
		{@const safeProfile = profile}
		<Card variant="elevated" padding="none" ariaLabel="Profile information">
			{#snippet children()}
				<!-- Banner -->
				<div class="relative h-32 w-full overflow-hidden rounded-t-xl">
					{#if safeProfile.banner}
						<img
							src={safeProfile.banner}
							alt=""
							class="h-full w-full object-cover opacity-0 transition-opacity duration-300"
							class:opacity-100={bannerLoaded}
							onload={() => (bannerLoaded = true)}
							loading="lazy"
							role="presentation"
						/>
					{:else}
						<div
							class="h-full w-full bg-linear-to-r from-primary-400 to-secondary-400"
							role="presentation"
						></div>
					{/if}
				</div>

				<!-- Avatar -->
				<div class="relative -mt-16 flex justify-center sm:ml-6 sm:justify-start">
					<div
						class="h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-canvas-200 dark:border-canvas-900"
					>
						{#if safeProfile.avatar}
							<img
								src={safeProfile.avatar}
								alt="{safeProfile.displayName || safeProfile.handle}'s profile picture"
								class="h-full w-full object-cover opacity-0 transition-opacity duration-300"
								class:opacity-100={imageLoaded}
								onload={() => (imageLoaded = true)}
								loading="lazy"
							/>
						{:else}
							<div
								class="flex h-full w-full items-center justify-center bg-primary-200 text-3xl font-bold text-primary-800 dark:bg-primary-800 dark:text-primary-200"
								role="img"
								aria-label="{safeProfile.displayName || safeProfile.handle}'s avatar initials"
							>
								{(safeProfile.displayName || safeProfile.handle).charAt(0).toUpperCase()}
							</div>
						{/if}
					</div>
				</div>

				<!-- Profile Content -->
				<div class="p-6">
					<h2 class="text-2xl font-bold text-ink-900 dark:text-ink-50">
						{safeProfile.displayName || safeProfile.handle}
					</h2>
					<p class="font-medium text-ink-700 dark:text-ink-200">@{safeProfile.handle}</p>
					{#if safeProfile.pronouns}
						<p class="text-sm italic text-ink-600 dark:text-ink-300">{safeProfile.pronouns}</p>
					{/if}

					{#if safeProfile.description}
						<p
							class="wrap-break-words mb-4 break-all whitespace-pre-wrap text-ink-700 dark:text-ink-200"
						>
							{safeProfile.description}
						</p>
					{/if}

					<div class="flex gap-6 text-sm font-medium" role="list" aria-label="Profile statistics">
						<div class="flex items-center gap-1" role="listitem">
							<span class="font-bold text-ink-900 dark:text-ink-50">
								{formatCompactNumber(safeProfile.postsCount, locale)}
							</span>
							<span class="text-ink-700 dark:text-ink-200">Posts</span>
						</div>
						<div class="flex items-center gap-1" role="listitem">
							<span class="font-bold text-ink-900 dark:text-ink-50">
								{formatCompactNumber(safeProfile.followersCount, locale)}
							</span>
							<span class="text-ink-700 dark:text-ink-200">Followers</span>
						</div>
						<div class="flex items-center gap-1" role="listitem">
							<span class="font-bold text-ink-900 dark:text-ink-50">
								{formatCompactNumber(safeProfile.followsCount, locale)}
							</span>
							<span class="text-ink-700 dark:text-ink-200">Following</span>
						</div>
					</div>

					<div class="mt-4">
						<LinkCard
							url="https://bsky.app/profile/{safeProfile.did}"
							title="View on Bluesky"
							variant="button"
						/>
					</div>
				</div>
			{/snippet}
		</Card>
	{/if}
</div>
