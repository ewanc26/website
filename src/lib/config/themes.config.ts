/**
 * Central theme configuration
 * Add new themes here and they'll automatically appear in the dropdown and type system
 */

export interface ThemeDefinition {
	value: string;
	label: string;
	description: string;
	color: string;
	category: 'neutral' | 'warm' | 'cool' | 'vibrant';
}

export const THEMES: readonly ThemeDefinition[] = [
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
] as const;

// Extract theme values for type safety
export type ColorTheme = (typeof THEMES)[number]['value'];

// Default theme
export const DEFAULT_THEME: ColorTheme = 'slate';

// Category labels
export const CATEGORY_LABELS = {
	neutral: 'Neutral',
	warm: 'Warm',
	cool: 'Cool',
	vibrant: 'Vibrant'
} as const;

// Group themes by category (for UI organization)
export const getThemesByCategory = () => {
	const grouped: Record<ThemeDefinition['category'], ThemeDefinition[]> = {
		neutral: [],
		warm: [],
		cool: [],
		vibrant: []
	};

	THEMES.forEach((theme) => {
		grouped[theme.category].push(theme);
	});

	return grouped;
};

// Utility to get a specific theme by value
export const getTheme = (value: string): ThemeDefinition | undefined => {
	return THEMES.find((theme) => theme.value === value);
};
