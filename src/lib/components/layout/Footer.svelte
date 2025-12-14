<script lang="ts">
	import type { ProfileData, SiteInfoData } from '$lib/services/atproto';
	import DecimalClock from './DecimalClock.svelte';

	export let profile: ProfileData | null = null;
	export let siteInfo: SiteInfoData | null = null;
	let loading = false;
	let error: string | null = null;
	let copyrightText: string;

	const currentYear = new Date().getFullYear();

	$: {
		console.log('[Footer] Reactive: siteInfo updated:', siteInfo);
		const birthYear = siteInfo?.additionalInfo?.websiteBirthYear;
		console.log('[Footer] Current year:', currentYear);
		console.log('[Footer] Birth year:', birthYear);
		console.log('[Footer] Birth year type:', typeof birthYear);

		if (!birthYear || typeof birthYear !== 'number') {
			console.log('[Footer] Using current year (invalid/missing birth year)');
			copyrightText = `${currentYear}`;
		} else if (birthYear > currentYear) {
			console.log('[Footer] Using current year (birth year in future)');
			copyrightText = `${currentYear}`;
		} else if (birthYear === currentYear) {
			console.log('[Footer] Using current year (birth year equals current)');
			copyrightText = `${currentYear}`;
		} else {
			console.log('[Footer] Using year range');
			copyrightText = `${birthYear} - ${currentYear}`;
		}
	}

	// Data is provided by layout load; no client-side fetch here to avoid using window.fetch during navigation.
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
							href="https://bsky.app/profile/{profile.did}"
							class="underline hover:text-primary-500 focus-visible:text-primary-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 dark:hover:text-primary-400 dark:focus-visible:text-primary-400"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Visit {profile.handle}'s Bluesky profile">@{profile.handle}</a
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
					<!-- Line 3: Version number -->
					<span aria-label="Version 10.3.1">v10.3.1</span>
				</div>
			</div>

			<!-- Right: Decimal Clock (hidden on mobile) -->
			<div class="hidden md:block">
				<DecimalClock />
			</div>
		</div>
	</div>
</footer>
