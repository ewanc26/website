<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchProfile, fetchSiteInfo } from '$lib/services/atproto';
	import type { ProfileData, SiteInfoData } from '$lib/services/atproto';
	import DecimalClock from './DecimalClock.svelte';
	import FooterProfile from './FooterProfile.svelte';
	import FooterDonations from './FooterDonations.svelte';

	let profile = $state<ProfileData | null>(null);
	let siteInfo = $state<SiteInfoData | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let showDonations = $state(false);

	const currentYear = new Date().getFullYear();

	let copyrightText = $derived.by(() => {
		const birthYear = siteInfo?.additionalInfo?.websiteBirthYear;
		return !birthYear || birthYear >= currentYear
			? `${currentYear}`
			: `${birthYear}—${currentYear}`;
	});

	onMount(() => {
		(async () => {
			try {
				const [p, s] = await Promise.all([
					fetchProfile().catch(() => null),
					fetchSiteInfo().catch(() => null)
				]);
				profile = p;
				siteInfo = s;
			} catch (err) {
				error = err instanceof Error ? err.message : 'Error loading footer';
			} finally {
				loading = false;
			}
		})();
	});
</script>

<footer
	class="mt-auto w-full border-t border-canvas-200 bg-canvas-50 py-3 transition-colors dark:border-canvas-800 dark:bg-canvas-950"
>
	<div class="container mx-auto px-6">
		<!-- Using items-center ensures the 'pill' shapes and text shapes share a center axis -->
		<div class="flex flex-col items-center justify-between gap-4 md:flex-row">
			<div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 md:justify-start">
				<FooterProfile {profile} {loading} {copyrightText} />

				<!-- This wrapper ensures the donation button doesn't jump line height -->
				<div class="flex items-center">
					<FooterDonations
						show={showDonations}
						onOpen={() => (showDonations = true)}
						onClose={() => (showDonations = false)}
					/>
				</div>
			</div>

			<!-- The Clock usually has internal padding, so we keep it in its own flex-center box -->
			<div class="flex items-center opacity-80 transition-opacity hover:opacity-100">
				<DecimalClock />
			</div>
		</div>
	</div>
</footer>
