<script lang="ts">
	import { noiseAvatarAction } from '@ewanc26/noise-avatar';

	/**
	 * Renders an `<img>` when `src` is present and loads successfully,
	 * otherwise falls back to a `<canvas>` filled with deterministic noise
	 * keyed on `seed`. Both elements receive the same `class` string so
	 * layout is identical regardless of which branch is active.
	 *
	 * Accessibility:
	 *  - Canvas with a non-empty `alt` → `aria-label={alt}`
	 *  - Canvas with no `alt`          → `aria-hidden="true"`
	 */

	interface Props {
		/** Image URL. When absent the canvas is rendered immediately. */
		src?: string | null | undefined;
		/** Deterministic seed passed to `noiseAvatarAction`. */
		seed: string;
		/** Alt text for the `<img>`; also used as `aria-label` on the canvas. */
		alt?: string;
		/** CSS classes applied to both `<img>` and `<canvas>`. */
		class?: string;
		loading?: 'lazy' | 'eager';
		role?: string;
	}

	let { src, seed, alt = '', class: className = '', loading = 'lazy', role }: Props = $props();

	let failed = $state(false);
</script>

{#if src && !failed}
	<img
		{src}
		{alt}
		class={className}
		{loading}
		{role}
		onerror={() => (failed = true)}
	/>
{:else}
	<canvas
		use:noiseAvatarAction={seed}
		class={className}
		{role}
		aria-label={alt || undefined}
		aria-hidden={alt ? undefined : 'true'}
	></canvas>
{/if}
