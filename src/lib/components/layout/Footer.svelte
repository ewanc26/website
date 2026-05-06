<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchProfile, fetchSiteInfo } from '$lib/services/atproto';
	import type { ProfileData, SiteInfoData } from '$lib/services/atproto';
	import DecimalClock from './DecimalClock.svelte';
	import { happyMacStore } from '$lib/stores';
	import { witchskyProfileUrl } from '$lib/config/urls';
	import { PUBLIC_KOFI_PAGE_ID } from '$env/static/public';
	import { Code } from '@lucide/svelte';
	import qrcode from 'qrcode-generator';

	let profile = $state<ProfileData | null>(null);
	let siteInfo = $state<SiteInfoData | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	const currentYear = new Date().getFullYear();

	let showHint = $derived($happyMacStore.clickCount >= 3 && $happyMacStore.clickCount < 24);

	let copyrightText = $derived.by(() => {
		const birthYear = siteInfo?.additionalInfo?.websiteBirthYear;
		if (!birthYear || typeof birthYear !== 'number' || birthYear >= currentYear) {
			return `${currentYear}`;
		}
		return `${birthYear} - ${currentYear}`;
	});

	// --- Theme-Aware QR SVG Renderer ---
	function generateQrSvg(data: string, size = 160): string {
		const qr = qrcode(0, 'M');
		qr.addData(data);
		qr.make();

		const modules = qr.getModuleCount();
		const border = 4;
		const total = modules + border * 2;
		const scale = size / total;
		const radius = scale * 0.15;

		let path = '';

		for (let y = 0; y < modules; y++) {
			for (let x = 0; x < modules; x++) {
				if (qr.isDark(x, y)) {
					const px = (x + border) * scale;
					const py = (y + border) * scale;
					const w = scale;
					const r = Math.min(radius, w / 2);
					const inner = w - 2 * r;

					path +=
						`M${px + r},${py}` +
						`h${inner}` +
						`a${r},${r} 0 0 1 ${r},${r}` +
						`v${inner}` +
						`a${r},${r} 0 0 1 -${r},${r}` +
						`h-${inner}` +
						`a${r},${r} 0 0 1 -${r},-${r}` +
						`v-${inner}` +
						`a${r},${r} 0 0 1 ${r},-${r}z `;
				}
			}
		}

		return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" class="block w-full h-full"><path d="${path}"/></svg>`;
	}

	// --- Crypto Config ---
	type Crypto = {
		label: string;
		coin: string;
		address: string;
		qrSvg?: string;
	};

	let cryptos = $state<Crypto[]>([
		{
			label: 'XMR',
			coin: 'Monero',
			address:
				'44yH2LpkSsrSmWQC3SVmrABw2MUhNjNCE365hG7Rr7veJYNPBD1f6dNgXNr2nc6ZcP3jEyj9vXnqmg7VBBPeS8uwMhJ4yXW'
		},
		{
			label: 'ETH',
			coin: 'Ethereum',
			address: '0x4B8c9d62ff89bc7199a197C55dac2abef1808B77'
		}
	]);

	let copiedIndex = $state<number | null>(null);
	let openQrIndex = $state<number | null>(null);

	async function copyAddress(address: string, index: number) {
		await navigator.clipboard.writeText(address);
		copiedIndex = index;
		setTimeout(() => (copiedIndex = null), 2000);
	}

	function toggleQr(index: number, event: MouseEvent) {
		event.stopPropagation();
		if (!cryptos[index].qrSvg) {
			cryptos[index].qrSvg = generateQrSvg(cryptos[index].address);
		}
		openQrIndex = openQrIndex === index ? null : index;
	}

	function handleWindowClick(event: MouseEvent) {
		if (openQrIndex !== null) {
			const target = event.target as HTMLElement;
			if (!target.closest('.crypto-container')) {
				openQrIndex = null;
			}
		}
	}

	onMount(() => {
		window.addEventListener('click', handleWindowClick);

		const init = async () => {
			try {
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
		};

		init();

		return () => {
			window.removeEventListener('click', handleWindowClick);
		};
	});
</script>

<footer
	class="mt-auto w-full border-t border-canvas-200 bg-canvas-50 py-6 transition-colors duration-300 dark:border-canvas-800 dark:bg-canvas-950"
>
	<div class="container mx-auto px-4">
		<div class="flex items-center justify-between">
			<div
				class="flex flex-1 flex-col items-center justify-center gap-2 text-center text-sm font-medium text-ink-800 md:items-start md:text-left dark:text-ink-100"
			>
				<div class="flex flex-col items-center gap-1 sm:flex-row sm:gap-2 md:items-start">
					<span>&copy; {copyrightText}</span>
					{#if loading}
						<span class="animate-pulse">Loading profile…</span>
					{:else if profile}
						<a
							href={witchskyProfileUrl(profile.did)}
							target="_blank"
							rel="noopener noreferrer"
							class="underline decoration-primary-300 hover:text-primary-600 dark:decoration-primary-700 dark:hover:text-primary-400"
							>@{profile.handle}</a
						>
						<a
							href="https://ko-fi.com/{PUBLIC_KOFI_PAGE_ID}"
							target="_blank"
							rel="noopener noreferrer"
							class="underline decoration-primary-300 hover:text-primary-600 dark:decoration-primary-700 dark:hover:text-primary-400"
							>support me</a
						>
					{:else if error}
						<span class="text-red-500">Profile unavailable</span>
					{/if}
				</div>

				<div class="flex flex-col gap-2 sm:flex-row">
					<span
						>Powered by <a
							href="https://atproto.com/guides/glossary#at-protocol"
							target="_blank"
							rel="noopener noreferrer"
							class="underline hover:text-primary-600 dark:hover:text-primary-400">atproto</a
						></span
					>
					<a
						href="https://github.com/ewanc26/website"
						target="_blank"
						rel="noopener noreferrer"
						class="underline hover:text-primary-600 dark:hover:text-primary-400">code</a
					>
				</div>

				<div class="flex items-center gap-2 text-xs opacity-70">
					<Code class="h-4 w-4" />
					<button
						type="button"
						onclick={() => happyMacStore.incrementClick()}
						class="hover:text-primary-600 dark:hover:text-primary-400"
					>
						v{__APP_VERSION__}
						{#if showHint}
							({$happyMacStore.clickCount}/24)
						{/if}
					</button>
					<a
						href="https://github.com/ewanc26/website/commit/{__GIT_COMMIT__}"
						target="_blank"
						rel="noopener noreferrer"
						class="font-mono hover:text-primary-600 dark:hover:text-primary-400"
						>#{__GIT_COMMIT__}</a
					>
				</div>

				<div class="mt-4 flex flex-col gap-2 text-xs">
					<span class="font-bold tracking-wider uppercase opacity-60">Donations</span>

					{#each cryptos as crypto, i}
						<div class="crypto-container relative flex items-center gap-3">
							<span class="font-mono font-bold text-primary-700 dark:text-primary-300"
								>{crypto.label}</span
							>

							<span class="hidden font-mono opacity-60 sm:inline">
								{crypto.address.slice(0, 8)}…{crypto.address.slice(-6)}
							</span>

							<div class="flex gap-2">
								<button
									type="button"
									onclick={() => copyAddress(crypto.address, i)}
									class="underline decoration-canvas-300 hover:text-primary-600 dark:decoration-canvas-700 dark:hover:text-primary-400"
								>
									{copiedIndex === i ? 'copied!' : 'copy'}
								</button>

								<button
									type="button"
									onclick={(e) => toggleQr(i, e)}
									class="underline decoration-canvas-300 hover:text-primary-600 dark:decoration-canvas-700 dark:hover:text-primary-400"
								>
									{openQrIndex === i ? 'hide qr' : 'qr'}
								</button>
							</div>

							{#if openQrIndex === i && crypto.qrSvg}
								<div
									class="animate-in fade-in zoom-in-90 absolute bottom-full left-0 z-50 mb-3 rounded-xl border border-canvas-200 bg-canvas-100 p-3 shadow-2xl transition-all duration-150 dark:border-canvas-700 dark:bg-canvas-800"
								>
									<div class="h-40 w-40 text-ink-950 dark:text-ink-50">
										{@html crypto.qrSvg}
									</div>
									<div
										class="mt-2 text-center font-mono text-[10px] font-bold tracking-tighter uppercase opacity-40"
									>
										{crypto.label} Address
									</div>
									<div
										class="absolute -bottom-2 left-6 h-4 w-4 rotate-45 border-r border-b border-canvas-200 bg-canvas-100 dark:border-canvas-700 dark:bg-canvas-800"
									></div>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>

			<div class="hidden md:block">
				<DecimalClock />
			</div>
		</div>
	</div>
</footer>
