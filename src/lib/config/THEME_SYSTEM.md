# Theme System Documentation

The color theme system is now centralized and easy to extend. All theme definitions are managed through a single configuration file.

## Architecture

- **`/src/lib/config/themes.config.ts`** - Central theme configuration (add new themes here)
- **`/src/lib/stores/colorTheme.ts`** - Theme state management
- **`/src/lib/components/layout/ColorThemeToggle.svelte`** - Theme picker UI
- **`/src/lib/styles/themes/*.css`** - Individual theme CSS files
- **`/src/lib/styles/themes.css`** - Theme CSS imports

## Adding a New Theme

To add a new theme, follow these steps:

### 1. Add Theme Definition to Config

Edit `/src/lib/config/themes.config.ts` and add your theme to the `THEMES` array:

```typescript
{
  value: 'midnight',           // Unique identifier (used in CSS and localStorage)
  label: 'Midnight',           // Display name in dropdown
  description: 'Deep night',   // Short description
  color: 'oklch(20% 0.05 240)', // Preview color (shown in dropdown)
  category: 'cool'             // 'neutral' | 'warm' | 'cool' | 'vibrant'
}
```

### 2. Create Theme CSS File

Create `/src/lib/styles/themes/midnight.css` with your color definitions:

```css
/* ============================================================================
   MIDNIGHT THEME - Deep night
   Primary: Dark blue
   Secondary: Navy
   Accent: Steel
   Hue: 240° (blue)
   ============================================================================ */
[data-color-theme='midnight'] {
  /* Define your CSS custom properties here */
  --color-primary-500: oklch(20% 0.05 240);
  /* ... other color definitions ... */
}
```

### 3. Import Theme CSS

Add the import to `/src/lib/styles/themes.css`:

```css
@import './themes/midnight.css';
```

## That's It!

The theme will automatically:
- ✅ Appear in the color theme dropdown
- ✅ Be type-safe in TypeScript
- ✅ Work with the theme switcher
- ✅ Persist in localStorage

## Configuration API

### `THEMES`
Array of all available themes. Each theme has:
- `value`: Unique identifier (string)
- `label`: Display name (string)
- `description`: Short description (string)
- `color`: Preview color in OKLCH format (string)
- `category`: Theme category (string)

### `ColorTheme`
TypeScript type automatically generated from theme values.

### `DEFAULT_THEME`
The default theme used when no preference is stored.

### `getThemesByCategory()`
Returns themes organized by category for UI rendering.

### `getTheme(value)`
Get a specific theme definition by its value.

## Example: Adding Multiple Themes

```typescript
// In themes.config.ts
export const THEMES: readonly ThemeDefinition[] = [
  // ... existing themes ...
  
  // New themes
  {
    value: 'midnight',
    label: 'Midnight',
    description: 'Deep night',
    color: 'oklch(20% 0.05 240)',
    category: 'cool'
  },
  {
    value: 'sunrise',
    label: 'Sunrise',
    description: 'Morning glow',
    color: 'oklch(75% 0.15 50)',
    category: 'warm'
  }
] as const;
```

Then create `midnight.css` and `sunrise.css` in the themes folder, and import them in `themes.css`.
