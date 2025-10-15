<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchProfile, type ProfileData } from '$lib/services/atproto';
	import LinkCard from './LinkCard.svelte';

	let profile: ProfileData | null = null;
	let loading = true;
	let error: string | null = null;
	let imageLoaded = false;
	let bannerLoaded = false;

	onMount(async () => {
		try {
			profile = await fetchProfile();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load profile';
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
</script>

<div
	class="mx-auto w-full max-w-2xl overflow-hidden rounded-xl bg-canvas-100 shadow-lg transition-all duration-300 dark:bg-canvas-900"
>
	<div class="relative h-32 w-full overflow-hidden rounded-t-xl">
		{#if loading}
			<div class="h-full w-full animate-pulse bg-canvas-200 dark:bg-canvas-800"></div>
		{:else if profile?.banner}
			<img
				src={profile!.banner}
				alt="Profile banner"
				class="h-full w-full object-cover opacity-0 transition-opacity duration-300"
				class:opacity-100={bannerLoaded}
				onload={() => (bannerLoaded = true)}
				loading="lazy"
			/>
		{:else}
			<div class="h-full w-full bg-gradient-to-r from-sage-400 to-mint-400"></div>
		{/if}
	</div>

	<div class="relative -mt-16 flex justify-center sm:ml-6 sm:justify-start">
		<div
			class="h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-canvas-200 dark:border-canvas-900"
		>
			{#if loading}
				<div class="h-full w-full animate-pulse bg-canvas-200 dark:bg-canvas-800"></div>
			{:else if profile?.avatar}
				<img
					src={profile!.avatar}
					alt={profile!.displayName || profile!.handle}
					class="h-full w-full object-cover opacity-0 transition-opacity duration-300"
					class:opacity-100={imageLoaded}
					onload={() => (imageLoaded = true)}
					loading="lazy"
				/>
			{:else}
				<div
					class="flex h-full w-full items-center justify-center bg-sage-200 text-3xl font-bold text-sage-800 dark:bg-sage-800 dark:text-sage-200"
				>
					{(profile!.displayName || profile!.handle).charAt(0).toUpperCase()}
				</div>
			{/if}
		</div>
	</div>

	<div class="p-6 pt-2 sm:pt-4">
		{#if loading}
			<div class="space-y-2">
				<div class="h-6 w-1/2 rounded bg-canvas-200 dark:bg-canvas-800"></div>
				<div class="h-4 w-1/3 rounded bg-canvas-200 dark:bg-canvas-800"></div>
				<div class="h-4 rounded bg-canvas-200 dark:bg-canvas-800"></div>
				<div class="h-4 w-5/6 rounded bg-canvas-200 dark:bg-canvas-800"></div>
				<div class="mt-4 flex gap-6">
					<div class="h-4 w-12 rounded bg-canvas-200 dark:bg-canvas-800"></div>
					<div class="h-4 w-12 rounded bg-canvas-200 dark:bg-canvas-800"></div>
					<div class="h-4 w-12 rounded bg-canvas-200 dark:bg-canvas-800"></div>
				</div>
				<div class="mt-4 h-10 w-36 rounded bg-canvas-200 dark:bg-canvas-800"></div>
			</div>
		{:else if profile}
			<h2 class="text-2xl font-bold text-ink-900 dark:text-ink-50">
				{profile!.displayName || profile!.handle}
			</h2>
			<p class="font-medium text-ink-700 dark:text-ink-200">@{profile!.handle}</p>

			{#if profile!.description}
				<p class="mb-4 whitespace-pre-wrap text-ink-700 dark:text-ink-200">
					{profile!.description}
				</p>
			{/if}

			<div class="flex gap-6 text-sm font-medium">
				<div class="flex items-center gap-1">
					<span class="font-bold text-ink-900 dark:text-ink-50"
						>{formatNumber(profile!.postsCount)}</span
					>
					<span class="text-ink-700 dark:text-ink-200">Posts</span>
				</div>
				<div class="flex items-center gap-1">
					<span class="font-bold text-ink-900 dark:text-ink-50"
						>{formatNumber(profile!.followersCount)}</span
					>
					<span class="text-ink-700 dark:text-ink-200">Followers</span>
				</div>
				<div class="flex items-center gap-1">
					<span class="font-bold text-ink-900 dark:text-ink-50"
						>{formatNumber(profile!.followsCount)}</span
					>
					<span class="text-ink-700 dark:text-ink-200">Following</span>
				</div>
			</div>

			<div class="mt-4">
				<LinkCard
					url="https://bsky.app/profile/{profile!.did}"
					title="View on Bluesky"
					variant="button"
				/>
			</div>
		{:else if error}
			<p class="text-red-600 dark:text-red-400">{error}</p>
		{/if}
	</div>
</div>
