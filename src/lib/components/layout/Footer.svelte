<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchProfile, fetchSiteInfo } from '$lib/services/atproto';
	import type { ProfileData, SiteInfoData } from '$lib/services/atproto';
	import DecimalClock from './DecimalClock.svelte';
	import { happyMacStore } from '$lib/stores';

	let profile: ProfileData | null = $state(null);
	let siteInfo: SiteInfoData | null = $state(null);
	let loading = $state(true);
	let error: string | null = $state(null);

	const currentYear = new Date().getFullYear();

	// Show click count hint after 3 clicks
	let showHint = $derived($happyMacStore.clickCount >= 3 && $happyMacStore.clickCount < 24);

	// Compute copyright text reactively
	let copyrightText = $derived.by(() => {
		const birthYear = siteInfo?.additionalInfo?.websiteBirthYear;

		if (!birthYear || typeof birthYear !== 'number') {
			return `${currentYear}`;
		} else if (birthYear > currentYear) {
			return `${currentYear}`;
		} else if (birthYear === currentYear) {
			return `${currentYear}`;
		} else {
			return `${birthYear} - ${currentYear}`;
		}
	});

	// Fetch data client-side for non-blocking layout
	onMount(async () => {
		try {
			// Fetch both in parallel
			const [profileData, siteInfoData] = await Promise.all([
				fetchProfile().catch(() => null),
				fetchSiteInfo().catch(() => null)
			]);
			profile = profileData;
			siteInfo = siteInfoData;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load footer data';
		} finally {
			loading = false;
		}
	});
</script>

<footer
	class="mt-auto w-full border-t border-canvas-200 bg-canvas-50 py-6 dark:border-canvas-800 dark:bg-canvas-950"
>
	<div class="container mx-auto px-4">
		<div class="flex items-center justify-between">
			<!-- Left: Copyright & Info (centered on mobile) -->
			<div
				class="flex flex-1 flex-col items-center justify-center gap-2 text-center text-sm font-medium text-ink-800 md:items-start md:text-left dark:text-ink-100"
			>
				<!-- Line 1: Copyright & Profile -->
				<div class="flex flex-col items-center gap-1 sm:flex-row sm:gap-2 md:items-start">
					<span>&copy; <span>{copyrightText}</span></span>
					{#if loading}
						<span role="status" aria-live="polite">Loading profile…</span>
					{:else if profile}
						<a
							href="https://witchsky.app/profile/{profile.did}"
							class="underline hover:text-primary-500 focus-visible:text-primary-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 dark:hover:text-primary-400 dark:focus-visible:text-primary-400"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Visit {profile.handle}'s Bluesky profile">@{profile.handle}</a
						>
						<a
						href="https://ko-fi.com/ewancroft"
						target="_blank"
						rel="noopener noreferrer"
						class="underline hover:text-primary-500 focus-visible:text-primary-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 dark:hover:text-primary-400 dark:focus-visible:text-primary-400"
						aria-label="Ko-fi donation page">support me</a
						>
					{:else if error}
						<span role="alert">Profile unavailable</span>
					{/if}
				</div>

				<!-- Line 2: Powered by & Code -->
				<div class="flex flex-col flex-wrap items-center gap-1 sm:flex-row sm:gap-2 md:items-start">
					<span
						>Powered by <a
							href="https://atproto.com/guides/glossary#at-protocol"
							class="underline hover:text-primary-500 focus-visible:text-primary-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 dark:hover:text-primary-400 dark:focus-visible:text-primary-400"
							target="_blank"
							rel="noopener noreferrer">atproto</a
						></span
					>
					<a
						href="https://github.com/ewanc26/website"
						target="_blank"
						rel="noopener noreferrer"
						class="underline hover:text-primary-500 focus-visible:text-primary-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 dark:hover:text-primary-400 dark:focus-visible:text-primary-400"
						aria-label="View source code on GitHub">code</a
					>
					<!-- Line 3: Version number (click 24 times for easter egg!) -->
					<button
						type="button"
						onclick={() => happyMacStore.incrementClick()}
						class="cursor-default transition-colors select-none hover:text-ink-600 dark:hover:text-ink-300"
						aria-label="Version 10.7.1{showHint
							? ` - ${$happyMacStore.clickCount} of 24 clicks`
							: ''}"
						title={showHint ? `${$happyMacStore.clickCount}/24` : ''}
					>
						v10.7.1{#if showHint}<span class="ml-1 text-xs opacity-60"
								>({$happyMacStore.clickCount}/24)</span
							>{/if}
					</button>
				</div>
			</div>

			<!-- Right: Decimal Clock (hidden on mobile) -->
			<div class="hidden md:block">
				<DecimalClock />
			</div>
		</div>
	</div>
</footer>
