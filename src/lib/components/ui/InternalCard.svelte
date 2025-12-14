<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** Optional href makes the card a link */
		href?: string;
		/** Link target */
		target?: string;
		/** Link rel attribute */
		rel?: string;
		/** Click handler for button variant */
		onclick?: () => void;
		/** Custom CSS classes */
		class?: string;
		/** Aria label for accessibility */
		ariaLabel?: string;
		/** Content snippet */
		children?: Snippet;
	}

	let {
		href,
		target = '_blank',
		rel = 'noopener noreferrer',
		onclick,
		class: customClass = '',
		ariaLabel,
		children
	}: Props = $props();

	const baseClasses =
		'flex items-start gap-3 rounded-lg bg-canvas-200 p-4 transition-colors hover:bg-canvas-300 dark:bg-canvas-800 dark:hover:bg-canvas-700 self-start';
	let combinedClasses = $derived(`${baseClasses} ${customClass}`);
</script>

{#if href}
	<a {href} {target} {rel} class={combinedClasses} aria-label={ariaLabel}>
		{#if children}
			{@render children()}
		{/if}
	</a>
{:else if onclick}
	<button type="button" {onclick} class={combinedClasses} aria-label={ariaLabel}>
		{#if children}
			{@render children()}
		{/if}
	</button>
{:else}
	<div class={combinedClasses} role={ariaLabel ? 'region' : undefined} aria-label={ariaLabel}>
		{#if children}
			{@render children()}
		{/if}
	</div>
{/if}
