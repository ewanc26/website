<script lang="ts">
	import { onMount } from 'svelte';
	import qrcode from 'qrcode-generator';
	import { X, Wallet, Check, Copy, Heart, Coffee, Github } from '@lucide/svelte';
	import { fade } from 'svelte/transition';
	import Card from '$lib/components/ui/Card.svelte';
	import { PUBLIC_KOFI_PAGE_ID } from '$env/static/public';

	interface Props {
		show: boolean;
		onClose: () => void;
		onOpen: () => void;
	}

	let { show, onClose, onOpen }: Props = $props();

	type Crypto = {
		label: string;
		coin: string;
		scheme: string;
		address: string;
		qrSvg?: string;
	};

	let cryptos = $state<Crypto[]>([
		{
			label: 'XMR',
			coin: 'Monero',
			scheme: 'monero',
			address:
				'44yH2LpkSsrSmWQC3SVmrABw2MUhNjNCE365hG7Rr7veJYNPBD1f6dNgXNr2nc6ZcP3jEyj9vXnqmg7VBBPeS8uwMhJ4yXW'
		},
		{
			label: 'ETH',
			coin: 'Ethereum',
			scheme: 'ethereum',
			address: '0x4B8c9d62ff89bc7199a197C55dac2abef1808B77'
		}
	]);

	let mounted = $state(false);
	let selectedIndex = $state(0);
	let copied = $state(false);
	let active = $derived(cryptos[selectedIndex]);

	function generateQrSvg(data: string, size = 200): string {
		const qr = qrcode(0, 'M');
		qr.addData(data);
		qr.make();
		const modules = qr.getModuleCount();
		const border = 4;
		const total = modules + border * 2;
		const scaleFactor = size / total;
		let path = '';
		for (let y = 0; y < modules; y++) {
			for (let x = 0; x < modules; x++) {
				if (qr.isDark(x, y)) {
					const px = (x + border) * scaleFactor;
					const py = (y + border) * scaleFactor;
					path += `M${px},${py}h${scaleFactor}v${scaleFactor}h-${scaleFactor}z `;
				}
			}
		}
		return `<svg viewBox="0 0 ${size} ${size}" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="w-full h-full" shape-rendering="crispEdges"><path d="${path}"/></svg>`;
	}

	async function copyAddress() {
		await navigator.clipboard.writeText(active.address);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	$effect(() => {
		if (show && !cryptos[selectedIndex].qrSvg) {
			const uri = `${active.scheme}:${active.address}`;
			cryptos[selectedIndex].qrSvg = generateQrSvg(uri);
		}
	});

	onMount(() => {
		mounted = true;
	});
</script>

<button
	onclick={onOpen}
	class="flex items-center gap-2 text-xs font-medium text-ink-600 underline decoration-canvas-300 underline-offset-4 transition-colors hover:text-primary-600 hover:decoration-primary-600 dark:text-ink-400 dark:decoration-canvas-700 dark:hover:text-primary-400"
>
	<Heart size={14} />
	Support
</button>

{#if show && mounted}
	<div
		transition:fade={{ duration: 150 }}
		class="fixed inset-0 z-9999 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
		onclick={onClose}
		onkeydown={(e) => (e.key === 'Escape' || e.key === 'Enter') && onClose()}
		role="button"
		tabindex="0"
		aria-label="Close modal"
	>
		<!-- Added tabindex="-1" to resolve the diagnostic error -->
		<div
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
			tabindex="-1"
			class="w-full max-w-sm outline-none"
		>
			<Card
				variant="default"
				padding="lg"
				class="relative max-h-[95vh] overflow-y-auto !rounded-[2.5rem]"
			>
				{#snippet children()}
					<button
						type="button"
						onclick={onClose}
						class="absolute top-6 right-6 rounded-full p-2 hover:bg-canvas-200 dark:hover:bg-canvas-800"
						aria-label="Close"
					>
						<X class="h-5 w-5" />
					</button>

					<div class="space-y-6">
						<div class="pt-2">
							<h2 class="text-2xl font-black text-ink-900 dark:text-ink-50">Support</h2>
							<p class="text-xs font-medium opacity-50">Crypto or Fiat</p>
						</div>

						<!-- Crypto Tabs -->
						<div class="space-y-4">
							<div
								role="tablist"
								class="flex gap-1 rounded-2xl bg-canvas-200 p-1 dark:bg-canvas-800"
							>
								{#each cryptos as crypto, i}
									<button
										type="button"
										role="tab"
										aria-selected={selectedIndex === i}
										onclick={() => {
											selectedIndex = i;
											copied = false;
										}}
										class="flex-1 rounded-xl py-2 text-[10px] font-black uppercase transition-all
                                        {selectedIndex === i
											? 'bg-canvas-50 shadow-sm dark:bg-canvas-700'
											: 'opacity-50 hover:opacity-100'}"
									>
										{crypto.label}
									</button>
								{/each}
							</div>

							<!-- QR Code Area -->
							<div class="aspect-square w-full rounded-3xl bg-white p-6 shadow-inner">
								<div class="qr-container h-full w-full">
									{#if active.qrSvg}
										{@html active.qrSvg}
									{/if}
								</div>
							</div>

							<!-- Address & Copy -->
							<div class="space-y-2">
								<div
									class="rounded-2xl border border-canvas-200 bg-canvas-100/50 p-3 dark:border-canvas-700/50 dark:bg-canvas-800/30"
								>
									<p class="font-mono text-[10px] break-all opacity-80 select-all">
										{active.address}
									</p>
								</div>
								<button
									type="button"
									onclick={copyAddress}
									class="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary-950 font-bold text-primary-50 transition-all hover:bg-primary-800 dark:bg-primary-50 dark:text-primary-950"
								>
									{#if copied}
										<Check size={16} /> Copied!
									{:else}
										<Copy size={16} /> Copy {active.label}
									{/if}
								</button>
							</div>
						</div>

						<div class="h-px w-full bg-canvas-200 dark:bg-canvas-800"></div>

						<!-- Fiat Links -->
						<div class="grid grid-cols-2 gap-3">
							<a
								href="https://ko-fi.com/{PUBLIC_KOFI_PAGE_ID}"
								target="_blank"
								rel="noopener noreferrer"
								class="group flex items-center justify-center gap-2 rounded-2xl border border-canvas-200 py-3 text-xs font-bold transition-all hover:border-primary-500 hover:bg-primary-500/5 dark:border-canvas-700 dark:hover:border-primary-400 dark:hover:bg-primary-400/5"
							>
								<Coffee
									size={16}
									class="transition-colors group-hover:text-primary-600 dark:group-hover:text-primary-400"
								/>
								Ko-fi
							</a>
							<a
								href="https://github.com/sponsors/ewanc26"
								target="_blank"
								rel="noopener noreferrer"
								class="group flex items-center justify-center gap-2 rounded-2xl border border-canvas-200 py-3 text-xs font-bold transition-all hover:border-primary-500 hover:bg-primary-500/5 dark:border-canvas-700 dark:hover:border-primary-400 dark:hover:bg-primary-400/5"
							>
								<Github
									size={16}
									class="transition-colors group-hover:text-primary-600 dark:group-hover:text-primary-400"
								/>
								GitHub
							</a>
						</div>
					</div>
				{/snippet}
			</Card>
		</div>
	</div>
{/if}

<style>
	.qr-container :global(svg) {
		width: 100%;
		height: 100%;
		fill: #000000 !important;
	}
</style>
