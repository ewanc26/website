<script lang="ts">
	import { onMount } from 'svelte';
	import { Palette, Check } from '@lucide/svelte';
	import { colorTheme, type ColorTheme } from '$lib/stores/colorTheme';
	import {
		getThemesByCategory,
		CATEGORY_LABELS,
		type ThemeDefinition
	} from '$lib/config/themes.config';

	let isOpen = $state(false);
	let mounted = $state(false);
	let currentTheme = $state<ColorTheme>('slate');

	// Get themes organized by category
	const themesByCategory = getThemesByCategory();
	type Category = keyof typeof CATEGORY_LABELS;

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
			<div class="max-h-128 overflow-y-auto p-2">
				<div class="mb-2 px-3 py-2 text-xs font-semibold uppercase text-ink-600 dark:text-ink-400">
					Color Themes
				</div>

				{#each Object.entries(themesByCategory) as [category, categoryThemes]}
					<div class="mb-3">
						<div class="mb-1.5 px-3 text-xs font-medium text-ink-500 dark:text-ink-500">
							{CATEGORY_LABELS[category as Category]}
						</div>
						<div class="space-y-1">
							{#each categoryThemes as theme}
								<button
									onclick={() => selectTheme(theme.value as ColorTheme)}
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
