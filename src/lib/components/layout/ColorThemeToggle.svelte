<script lang="ts">
	import { onMount } from 'svelte';
	import { Palette, Check } from '@lucide/svelte';
	import { colorTheme, type ColorTheme } from '$lib/stores/colorTheme';

	let isOpen = $state(false);
	let mounted = $state(false);
	let currentTheme = $state<ColorTheme>('sage');

	interface ThemeDefinition {
		value: ColorTheme;
		label: string;
		description: string;
		color: string;
		category: 'neutral' | 'warm' | 'cool' | 'vibrant';
	}

	const themes: ThemeDefinition[] = [
		// Neutral themes
		{
			value: 'sage',
			label: 'Sage',
			description: 'Calm green-blue',
			color: 'oklch(77.77% 0.182 127.42)',
			category: 'neutral'
		},
		{
			value: 'monochrome',
			label: 'Monochrome',
			description: 'Pure greyscale',
			color: 'oklch(78% 0 0)',
			category: 'neutral'
		},
		{
			value: 'slate',
			label: 'Slate',
			description: 'Blue-grey',
			color: 'oklch(78.5% 0.095 230)',
			category: 'neutral'
		},
		// Warm themes
		{
			value: 'ruby',
			label: 'Ruby',
			description: 'Bold red',
			color: 'oklch(81.5% 0.228 10)',
			category: 'warm'
		},
		{
			value: 'coral',
			label: 'Coral',
			description: 'Orange-pink',
			color: 'oklch(81.8% 0.212 20)',
			category: 'warm'
		},
		{
			value: 'sunset',
			label: 'Sunset',
			description: 'Warm orange',
			color: 'oklch(80.5% 0.208 45)',
			category: 'warm'
		},
		{
			value: 'amber',
			label: 'Amber',
			description: 'Bright yellow',
			color: 'oklch(82.8% 0.195 85)',
			category: 'warm'
		},
		// Cool themes
		{
			value: 'forest',
			label: 'Forest',
			description: 'Natural green',
			color: 'oklch(79.5% 0.195 145)',
			category: 'cool'
		},
		{
			value: 'teal',
			label: 'Teal',
			description: 'Blue-green',
			color: 'oklch(79% 0.205 195)',
			category: 'cool'
		},
		{
			value: 'ocean',
			label: 'Ocean',
			description: 'Deep blue',
			color: 'oklch(78.2% 0.188 240)',
			category: 'cool'
		},
		// Vibrant themes
		{
			value: 'lavender',
			label: 'Lavender',
			description: 'Soft purple',
			color: 'oklch(82% 0.215 295)',
			category: 'vibrant'
		},
		{
			value: 'rose',
			label: 'Rose',
			description: 'Pink-red',
			color: 'oklch(83.5% 0.230 350)',
			category: 'vibrant'
		}
	];

	// Group themes by category
	const themesByCategory = {
		neutral: themes.filter((t) => t.category === 'neutral'),
		warm: themes.filter((t) => t.category === 'warm'),
		cool: themes.filter((t) => t.category === 'cool'),
		vibrant: themes.filter((t) => t.category === 'vibrant')
	};

	const categoryLabels = {
		neutral: 'Neutral',
		warm: 'Warm',
		cool: 'Cool',
		vibrant: 'Vibrant'
	};

	onMount(() => {
		colorTheme.init();

		const unsubscribe = colorTheme.subscribe((state) => {
			currentTheme = state.current;
			mounted = state.mounted;
		});

		// Close dropdown when clicking outside
		const handleClickOutside = (e: MouseEvent) => {
			if (isOpen) {
				const target = e.target as HTMLElement;
				if (!target.closest('.color-theme-dropdown')) {
					isOpen = false;
				}
			}
		};
		document.addEventListener('click', handleClickOutside);

		// Close on Escape key
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				isOpen = false;
			}
		};
		document.addEventListener('keydown', handleEscape);

		return () => {
			unsubscribe();
			document.removeEventListener('click', handleClickOutside);
			document.removeEventListener('keydown', handleEscape);
		};
	});

	function toggleDropdown() {
		isOpen = !isOpen;
	}

	function selectTheme(theme: ColorTheme) {
		colorTheme.setTheme(theme);
		isOpen = false;
	}
</script>

<div class="color-theme-dropdown relative">
	<button
		onclick={toggleDropdown}
		class="relative flex h-10 w-10 items-center justify-center rounded-lg bg-canvas-200 text-ink-900 transition-all hover:bg-canvas-300 dark:bg-canvas-800 dark:text-ink-50 dark:hover:bg-canvas-700"
		aria-label="Change color theme"
		aria-expanded={isOpen}
		aria-controls="color-theme-menu"
		type="button"
	>
		{#if mounted}
			<Palette class="h-5 w-5" aria-hidden="true" />
		{:else}
			<div class="h-5 w-5 animate-pulse rounded bg-canvas-300 dark:bg-canvas-700"></div>
		{/if}
	</button>

	{#if isOpen}
		<div
			id="color-theme-menu"
			class="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border border-canvas-200 bg-canvas-50 shadow-xl dark:border-canvas-800 dark:bg-canvas-950"
			role="menu"
		>
			<div class="max-h-[32rem] overflow-y-auto p-2">
				<div class="mb-2 px-3 py-2 text-xs font-semibold uppercase text-ink-600 dark:text-ink-400">
					Color Themes
				</div>

				{#each Object.entries(themesByCategory) as [category, categoryThemes]}
					<div class="mb-3">
						<div class="mb-1.5 px-3 text-xs font-medium text-ink-500 dark:text-ink-500">
							{categoryLabels[category]}
						</div>
						<div class="space-y-1">
							{#each categoryThemes as theme}
								<button
									onclick={() => selectTheme(theme.value)}
									class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-canvas-100 focus-visible:bg-canvas-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 dark:hover:bg-canvas-900 dark:focus-visible:bg-canvas-900"
									role="menuitem"
									aria-current={currentTheme === theme.value ? 'true' : undefined}
								>
									<div
										class="h-6 w-6 shrink-0 rounded-md border border-canvas-300 shadow-sm dark:border-canvas-700"
										style="background-color: {theme.color}"
										aria-hidden="true"
									></div>
									<div class="flex-1 min-w-0">
										<div class="font-medium text-ink-900 dark:text-ink-50">{theme.label}</div>
										<div class="text-xs text-ink-600 dark:text-ink-400">{theme.description}</div>
									</div>
									{#if currentTheme === theme.value}
										<Check
											class="h-5 w-5 shrink-0 text-primary-600 dark:text-primary-400"
											aria-hidden="true"
										/>
									{/if}
								</button>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
