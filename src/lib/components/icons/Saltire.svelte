<script lang="ts">
	/**
	 * Saltire — the diagonal cross of St Andrew, Scotland's flag reduced to
	 * its sigil: two crossing bars, corner to corner. Matches the stroke
	 * weight of Triskele's filled bulk rather than Pentacle's thin line, so
	 * the three sigils read as a deliberately mixed set, not a mismatched one.
	 */
	interface Props {
		size?: number | string;
		class?: string;
		style?: string;
		'aria-hidden'?: boolean;
		'aria-label'?: string;
	}

	let {
		size = 24,
		class: className = '',
		style = '',
		'aria-hidden': ariaHidden = true,
		'aria-label': ariaLabel = undefined
	}: Props = $props();
</script>

<svg
	viewBox="0 0 12 12"
	xmlns="http://www.w3.org/2000/svg"
	width={size}
	height={size}
	class={className}
	{style}
	aria-hidden={ariaHidden}
	aria-label={ariaLabel}
	role={ariaLabel ? 'img' : undefined}
>
	<path
		style="fill:none;stroke:currentColor;stroke-width:1.15;stroke-linecap:round;stroke-miterlimit:10"
		d="M1 1l10 10M11 1L1 11"
	/>
</svg>
