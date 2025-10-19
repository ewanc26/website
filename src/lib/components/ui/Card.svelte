<script lang="ts">
	import { ExternalLink } from '@lucide/svelte';
	import type { Snippet } from 'svelte';

	export interface Badge {
		text: string;
		color?: 'mint' | 'sage' | 'jade' | 'ink';
		variant?: 'solid' | 'soft';
	}

	interface Props {
		/** Card variant affecting visual style */
		variant?: 'default' | 'elevated' | 'flat' | 'button' | 'outline';
		/** Padding size (use 'none' for custom padding) */
		padding?: 'sm' | 'md' | 'lg' | 'none';
		/** Whether the card is clickable (adds hover effects) */
		interactive?: boolean;
		/** External link href (makes entire card a link) */
		href?: string;
		/** Link target */
		target?: string;
		/** Link rel attribute */
		rel?: string;
		/** Show external link icon */
		showExternalIcon?: boolean;
		/** Badges to display at the top of the card */
		badges?: Badge[];
		/** Loading state */
		loading?: boolean;
		/** Error state */
		error?: boolean;
		/** Error message */
		errorMessage?: string;
		/** Custom CSS classes */
		class?: string;
		/** Aria label for accessibility */
		ariaLabel?: string;
		/** Content snippet */
		children?: Snippet;
		/** Custom loading skeleton snippet */
		skeleton?: Snippet;
	}

	let {
		variant = 'default',
		padding = 'md',
		interactive = false,
		href,
		target = '_blank',
		rel = 'noopener noreferrer',
		showExternalIcon = false,
		badges = [],
		loading = false,
		error = false,
		errorMessage = 'Something went wrong',
		class: customClass = '',
		ariaLabel,
		children,
		skeleton
	}: Props = $props();

	// Determine if card should be a link
	const isLink = !!href;

	// Base classes
	const baseClasses = 'rounded-xl transition-all duration-300';

	// Variant classes
	const variantClasses = {
		default: 'bg-canvas-100 dark:bg-canvas-900 shadow-md',
		elevated: 'bg-canvas-100 dark:bg-canvas-900 shadow-lg hover:shadow-xl',
		flat: 'bg-canvas-200 dark:bg-canvas-800',
		button:
			'bg-canvas-200 dark:bg-canvas-800 hover:bg-canvas-300 dark:hover:bg-canvas-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-600',
		outline:
			'bg-transparent border-2 border-canvas-300 dark:border-canvas-700 hover:border-sage-400 dark:hover:border-sage-600'
	};

	// Padding classes
	const paddingClasses = {
		none: '',
		sm: 'p-4',
		md: 'p-6',
		lg: 'p-8'
	};

	// Interactive classes (hover effects)
	const interactiveClasses = interactive || isLink ? 'cursor-pointer' : '';

	// Combine all classes
	const cardClasses = `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${interactiveClasses} ${customClass}`;

	/**
	 * Get badge styling classes based on color and variant
	 */
	function getBadgeClasses(badge: Badge): string {
		const baseStyle =
			badge.variant === 'soft'
				? 'px-2 py-0.5 text-xs font-medium rounded'
				: 'px-2 py-0.5 text-xs font-semibold uppercase rounded';

		const colorClasses = {
			mint:
				badge.variant === 'soft'
					? 'bg-mint-100 text-mint-800 dark:bg-mint-900 dark:text-mint-200'
					: 'bg-mint-500 text-white dark:bg-mint-600',
			sage:
				badge.variant === 'soft'
					? 'bg-sage-100 text-sage-800 dark:bg-sage-900 dark:text-sage-200'
					: 'bg-sage-500 text-white dark:bg-sage-600',
			jade:
				badge.variant === 'soft'
					? 'bg-jade-100 text-jade-800 dark:bg-jade-900 dark:text-jade-200'
					: 'bg-jade-500 text-white dark:bg-jade-600',
			ink:
				badge.variant === 'soft'
					? 'bg-ink-100 text-ink-800 dark:bg-ink-800 dark:text-ink-100'
					: 'bg-ink-700 text-white dark:bg-ink-300 dark:text-ink-900'
		};

		return `${baseStyle} ${colorClasses[badge.color || 'ink']}`;
	}
</script>

{#if loading}
	<div class="{cardClasses} animate-pulse" aria-label="Loading content" role="status">
		{#if skeleton}
			{@render skeleton()}
		{:else}
			<!-- Default skeleton -->
			<div class="space-y-3">
				<div class="h-4 w-3/4 rounded bg-canvas-300 dark:bg-canvas-700"></div>
				<div class="h-4 w-full rounded bg-canvas-300 dark:bg-canvas-700"></div>
				<div class="h-4 w-5/6 rounded bg-canvas-300 dark:bg-canvas-700"></div>
			</div>
		{/if}
		<span class="sr-only">Loading...</span>
	</div>
{:else if error}
	<div
		class="{cardClasses} border-2 border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
		role="alert"
		aria-live="polite"
	>
		<p class="text-red-600 dark:text-red-400">{errorMessage}</p>
	</div>
{:else if isLink}
	<a {href} {target} {rel} class={cardClasses} aria-label={ariaLabel || `Link to ${href}`}>
		{#if badges.length > 0}
			<div class="mb-3 flex flex-wrap items-center gap-2">
				{#each badges as badge}
					<span class={getBadgeClasses(badge)}>
						{badge.text}
					</span>
				{/each}
			</div>
		{/if}

		<div class="flex items-start justify-between gap-3">
			<div class="flex-1">
				{#if children}
					{@render children()}
				{/if}
			</div>

			{#if showExternalIcon}
				<ExternalLink
					class="h-4 w-4 flex-shrink-0 text-ink-700 transition-colors group-hover:text-sage-600 dark:text-ink-200 dark:group-hover:text-sage-400"
					aria-hidden="true"
				/>
			{/if}
		</div>
	</a>
{:else}
	<div class={cardClasses} role={ariaLabel ? 'region' : undefined} aria-label={ariaLabel}>
		{#if badges.length > 0}
			<div class="mb-3 flex flex-wrap items-center gap-2">
				{#each badges as badge}
					<span class={getBadgeClasses(badge)}>
						{badge.text}
					</span>
				{/each}
			</div>
		{/if}

		{#if children}
			{@render children()}
		{/if}
	</div>
{/if}
