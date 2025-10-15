<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchProfile, type ProfileData } from '$lib/services/atproto';

	let profile: ProfileData | null = null;
	let loading = true;
	let error: string | null = null;

	const currentYear = new Date().getFullYear();
	const copyrightText = `${currentYear}`;

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

<footer
	class="mt-auto w-full border-t border-canvas-200 bg-canvas-50 py-6 dark:border-canvas-800 dark:bg-canvas-950"
>
	<div class="container mx-auto space-y-2 px-4 text-center text-sm font-medium text-ink-800 dark:text-ink-100">
		<!-- Line 1: Copyright & Profile -->
		<div class="flex flex-col items-center justify-center gap-1 sm:flex-row sm:gap-2">
			<span>&copy; <span>{copyrightText}</span></span>
			{#if loading}
				<span>Loading profile…</span>
			{:else if profile}
				<a
					href="https://bsky.app/profile/{profile.did}"
					class="underline hover:text-sage-500 dark:hover:text-sage-400">@{profile.handle}</a
				>
			{:else if error}
				<span>Profile unavailable</span>
			{/if}
		</div>

		<!-- Line 2: Powered by & Code -->
		<div class="flex flex-col flex-wrap items-center justify-center gap-1 sm:flex-row sm:gap-2">
			<span
				>Powered by <a
					href="https://atproto.com/guides/glossary#at-protocol"
					class="underline hover:text-sage-500 dark:hover:text-sage-400">atproto</a
				></span
			>
			<a
				href="https://github.com/ewanc26/website"
				target="_blank"
				rel="noopener noreferrer"
				class="underline hover:text-sage-500 dark:hover:text-sage-400">code</a
			>
		</div>
	</div>
</footer>
