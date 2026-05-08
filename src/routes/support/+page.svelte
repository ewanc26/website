<script lang="ts">
	import qrcode from 'qrcode-generator';
	import { Coffee, Github, Heart } from '@lucide/svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { MetaTags } from '$lib/components/seo';
	import { PUBLIC_KOFI_PAGE_ID } from '$env/static/public';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type Crypto = {
		label: string;
		coin: string;
		scheme: string;
		address: string;
		preferred?: boolean;
		qrSvg?: string;
	};

	let cryptos = $state<Crypto[]>([
		{
			label: 'XMR',
			coin: 'Monero',
			scheme: 'monero',
			address:
				'44yH2LpkSsrSmWQC3SVmrABw2MUhNjNCE365hG7Rr7veJYNPBD1f6dNgXNr2nc6ZcP3jEyj9vXnqmg7VBBPeS8uwMhJ4yXW',
			preferred: true
		},
		{
			label: 'ETH',
			coin: 'Ethereum',
			scheme: 'ethereum',
			address: '0x4B8c9d62ff89bc7199a197C55dac2abef1808B77'
		},
		{
			label: 'BTC',
			coin: 'Bitcoin',
			scheme: 'bitcoin',
			address: 'bc1qp3l6e9pjc5jan7ulpd58av8wfdtyhrchj84clh'
		}
	]);

	type Tab = 'fiat' | 'crypto';
	let activeTab = $state<Tab>('fiat');
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
		if (activeTab === 'crypto' && !cryptos[selectedIndex].qrSvg) {
			const uri = `${active.scheme}:${active.address}`;
			cryptos[selectedIndex].qrSvg = generateQrSvg(uri);
		}
	});
</script>

<MetaTags meta={data.meta} />

<div class="mx-auto max-w-md space-y-6">
	<div class="flex items-center gap-2">
		<Heart size={20} class="text-primary-600 dark:text-primary-400" />
		<h1 class="text-xl font-black text-ink-900 dark:text-ink-50">Support my work</h1>
	</div>

	<p class="text-sm font-medium opacity-60">
		If you find my projects useful, consider buying me a tea.
	</p>

	<!-- Fiat / Crypto Tabs -->
	<div role="tablist" class="flex gap-1 rounded-2xl bg-canvas-200 p-1 dark:bg-canvas-800">
		<button
			type="button"
			role="tab"
			aria-selected={activeTab === 'fiat'}
			onclick={() => (activeTab = 'fiat')}
			class="flex-1 rounded-xl py-2 text-xs font-black uppercase transition-all
				{activeTab === 'fiat'
				? 'bg-canvas-50 shadow-sm dark:bg-canvas-700'
				: 'opacity-50 hover:opacity-100'}"
		>
			Fiat
		</button>
		<button
			type="button"
			role="tab"
			aria-selected={activeTab === 'crypto'}
			onclick={() => (activeTab = 'crypto')}
			class="flex-1 rounded-xl py-2 text-xs font-black uppercase transition-all
				{activeTab === 'crypto'
				? 'bg-canvas-50 shadow-sm dark:bg-canvas-700'
				: 'opacity-50 hover:opacity-100'}"
		>
			Crypto
		</button>
	</div>

	{#if activeTab === 'fiat'}
		<div class="grid grid-cols-2 gap-3">
			<a
				href="https://ko-fi.com/{PUBLIC_KOFI_PAGE_ID}"
				target="_blank"
				rel="noopener noreferrer"
				class="group flex items-center justify-center gap-2 rounded-2xl border border-canvas-200 py-4 text-sm font-bold transition-all hover:border-primary-500 hover:bg-primary-500/5 dark:border-canvas-700 dark:hover:border-primary-400 dark:hover:bg-primary-400/5"
			>
				<Coffee
					size={18}
					class="transition-colors group-hover:text-primary-600 dark:group-hover:text-primary-400"
				/>
				Ko-fi
			</a>
			<a
				href="https://github.com/sponsors/ewanc26"
				target="_blank"
				rel="noopener noreferrer"
				class="group flex items-center justify-center gap-2 rounded-2xl border border-canvas-200 py-4 text-sm font-bold transition-all hover:border-primary-500 hover:bg-primary-500/5 dark:border-canvas-700 dark:hover:border-primary-400 dark:hover:bg-primary-400/5"
			>
				<Github
					size={18}
					class="transition-colors group-hover:text-primary-600 dark:group-hover:text-primary-400"
				/>
				GitHub
			</a>
		</div>
	{:else}
		<div class="space-y-3">
			{#if active.preferred}
				<p class="text-xs font-medium opacity-60">Preferred: Monero (XMR)</p>
			{/if}

			<!-- Crypto Tabs -->
			<div role="tablist" class="flex gap-1 rounded-2xl bg-canvas-200 p-1 dark:bg-canvas-800">
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
					class="rounded-2xl border border-canvas-200 bg-canvas-100/50 p-4 dark:border-canvas-700/50 dark:bg-canvas-800/30"
				>
					<p class="font-mono text-xs break-all opacity-80 select-all">
						{active.address}
					</p>
				</div>
				<button
					type="button"
					onclick={copyAddress}
					class="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary-950 font-bold text-primary-50 transition-all hover:bg-primary-800 active:bg-primary-800 dark:bg-primary-50 dark:text-primary-950 dark:hover:bg-primary-200 dark:active:bg-primary-200"
				>
					{#if copied}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<polyline points="20 6 9 17 4 12" />
						</svg>
						Copied!
					{:else}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
							<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
						</svg>
						Copy {active.label}
					{/if}
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.qr-container :global(svg) {
		width: 100%;
		height: 100%;
		fill: #000000 !important;
	}
</style>
