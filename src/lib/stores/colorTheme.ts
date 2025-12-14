import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type ColorTheme =
	| 'sage' // Default (existing)
	| 'monochrome' // Greyscale
	// Rainbow spectrum
	| 'ruby' // Red
	| 'sunset' // Orange
	| 'amber' // Yellow
	| 'forest' // Green
	| 'ocean' // Blue
	| 'lavender' // Purple
	| 'rose' // Pink
	// Additional variations
	| 'teal' // Blue-green
	| 'coral' // Orange-pink
	| 'slate'; // Blue-grey

interface ColorThemeState {
	current: ColorTheme;
	mounted: boolean;
}

const STORAGE_KEY = 'color-theme';
const DEFAULT_THEME: ColorTheme = 'slate';

function createColorThemeStore() {
	const { subscribe, set, update } = writable<ColorThemeState>({
		current: DEFAULT_THEME,
		mounted: false
	});

	return {
		subscribe,
		init: () => {
			if (!browser) return;

			const stored = localStorage.getItem(STORAGE_KEY) as ColorTheme | null;
			const theme = stored || DEFAULT_THEME;

			update((state) => ({ ...state, current: theme, mounted: true }));
			
			// Only apply theme if not already applied (to prevent flash)
			const currentTheme = document.documentElement.getAttribute('data-color-theme');
			if (currentTheme !== theme) {
				applyTheme(theme);
			}
		},
		setTheme: (theme: ColorTheme) => {
			if (!browser) return;

			localStorage.setItem(STORAGE_KEY, theme);
			update((state) => ({ ...state, current: theme }));
			applyTheme(theme);
		}
	};
}

function applyTheme(theme: ColorTheme) {
	if (!browser) return;

	const root = document.documentElement;
	root.setAttribute('data-color-theme', theme);
}

export const colorTheme = createColorThemeStore();
