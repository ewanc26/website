// App-specific layout components stay local.
export { default as Header } from './Header.svelte';
export { default as Footer } from './Footer.svelte';
export { default as ColorThemeToggle } from './ColorThemeToggle.svelte';

// DynamicLinks stays local — it uses the DID-bound service wrapper.
export { default as DynamicLinks } from './main/DynamicLinks.svelte';

// Navigation progress bar for page transitions.
export { default as NavigationProgress } from './main/NavigationProgress.svelte';

// These are shared and prop-only — re-export from the package.
export { ThemeToggle, WolfToggle, ScrollToTop } from '@ewanc26/ui';
export { LinkCard, ProfileCard } from '@ewanc26/ui';
