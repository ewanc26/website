import { writable } from 'svelte/store';
import { DEFAULT_THEME, type ColorTheme } from '../config/themes.config.js';

const browser = typeof window !== 'undefined';

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
			const currentTheme = document.documentElement.getAttribute('data-color-theme');
			if (currentTheme !== theme) applyTheme(theme);
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
	document.documentElement.setAttribute('data-color-theme', theme);
}

export const colorTheme = createColorThemeStore();
export type { ColorTheme };
