<script lang="ts">
	import { onMount } from 'svelte';
	import { Palette, Check } from '@lucide/svelte';
	import { colorTheme, type ColorTheme } from '$lib/stores/colorTheme';
	import { colorThemeDropdownOpen } from '$lib/stores/dropdownState';
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

		// Subscribe to dropdown state
		const unsubDropdown = colorThemeDropdownOpen.subscribe((open) => {
			isOpen = open;
		});

		// Close dropdown when clicking outside (desktop only)
		const handleClickOutside = (e: MouseEvent) => {
			if (isOpen && window.innerWidth >= 768) {
				const target = e.target as HTMLElement;
				if (!target.closest('.color-theme-dropdown')) {
					colorThemeDropdownOpen.set(false);
				}
			}
		};
		document.addEventListener('click', handleClickOutside);

		// Close on Escape key (desktop only, mobile handled by Header)
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen && window.innerWidth >= 768) {
				colorThemeDropdownOpen.set(false);
			}
		};
		document.addEventListener('keydown', handleEscape);

		return () => {
			unsubscribe();
			unsubDropdown();
			document.removeEventListener('click', handleClickOutside);
			document.removeEventListener('keydown', handleEscape);
		};
	});

	function toggleDropdown() {
		colorThemeDropdownOpen.set(!isOpen);
	}

	function selectTheme(theme: ColorTheme) {
		colorTheme.setTheme(theme);
		colorThemeDropdownOpen.set(false);
	}
</script>

<div class="color-theme-dropdown relative">
	<button
		onclick={toggleDropdown}
		class="relative flex h-10 w-10 items-center justify-center rounded-lg bg-canvas-200 text-ink-900 transition-all hover:bg-canvas-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 dark:bg-canvas-800 dark:text-ink-50 dark:hover:bg-canvas-700"
		aria-label="Change colour theme"
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
		<!-- Desktop ONLY: Dropdown menu -->
		<div
			id="color-theme-menu"
			class="absolute top-full right-0 z-50 mt-2 hidden w-72 rounded-lg border border-canvas-200 bg-canvas-50 shadow-xl md:block dark:border-canvas-800 dark:bg-canvas-950"
			role="menu"
			aria-label="Colour theme menu"
		>
			<div class="max-h-128 overflow-y-auto p-2">
				<div class="mb-2 px-3 py-2 text-xs font-semibold text-ink-600 uppercase dark:text-ink-400">
					Colour Themes
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
									class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600
										{currentTheme === theme.value
										? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
										: 'text-ink-700 hover:bg-canvas-100 focus-visible:bg-canvas-100 dark:text-ink-200 dark:hover:bg-canvas-900 dark:focus-visible:bg-canvas-900'}"
									role="menuitem"
									aria-current={currentTheme === theme.value ? 'true' : undefined}
								>
									<div
										class="h-6 w-6 shrink-0 rounded-md border border-canvas-300 shadow-sm dark:border-canvas-700"
										style="background-color: {theme.color}"
										aria-hidden="true"
									></div>
									<div class="min-w-0 flex-1">
										<div
											class="font-medium {currentTheme === theme.value
												? ''
												: 'text-ink-900 dark:text-ink-50'}"
										>
											{theme.label}
										</div>
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
