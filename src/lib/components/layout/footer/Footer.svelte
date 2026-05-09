<script lang="ts">
	import DecimalClock from './clock/DecimalClock.svelte';
	import FooterProfile from './FooterProfile.svelte';
	import FooterDonations from './FooterDonations.svelte';
	import type { ProfileData, SiteInfoData } from '$lib/services/atproto';

	interface Props {
		profile: ProfileData | null;
		siteInfo: SiteInfoData | null;
	}

	let { profile, siteInfo }: Props = $props();

	let visible = $state(false);

	const currentYear = new Date().getFullYear();

	let copyrightText = $derived.by(() => {
		const birthYear = siteInfo?.additionalInfo?.websiteBirthYear;
		return !birthYear || birthYear >= currentYear
			? `${currentYear}`
			: `${birthYear}—${currentYear}`;
	});

	import { onMount } from 'svelte';

	onMount(() => {
		// Fade in when footer scrolls into view
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					visible = true;
					observer.disconnect();
				}
			},
			{ threshold: 0.1 }
		);
		const footer = document.querySelector('footer');
		if (footer) observer.observe(footer);
		return () => observer.disconnect();
	});
</script>

<footer
	class="mt-auto w-full border-t border-canvas-200 bg-canvas-50 py-3 transition-colors dark:border-canvas-800 dark:bg-canvas-950"
	class:animate-fade-in={visible}
>
	<div class="container mx-auto px-6">
		<!-- Using items-center ensures the 'pill' shapes and text shapes share a center axis -->
		<div class="flex flex-col items-center justify-between gap-4 md:flex-row">
			<div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 md:justify-start">
				<FooterProfile {profile} {copyrightText} />

				<!-- This wrapper ensures the donation button doesn't jump line height -->
				<div class="flex items-center">
					<FooterDonations />
				</div>
			</div>

			<!-- The Clock usually has internal padding, so we keep it in its own flex-center box -->
			<div class="flex items-center opacity-80 transition-opacity hover:opacity-100">
				<DecimalClock />
			</div>
		</div>
	</div>
</footer>
