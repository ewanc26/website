import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { DEFAULT_THEME, type ColorTheme } from '$lib/config/themes.config';

interface ColorThemeState {
	current: ColorTheme;
	mounted: boolean;
}

const STORAGE_KEY = 'color-theme';

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
export type { ColorTheme };
