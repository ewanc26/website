<script lang="ts">
	/**
	 * Saltire — the flag of Scotland reduced to its mark: a white diagonal
	 * cross reaching corner to corner, on a single field. The official
	 * construction (Lord Lyon / Scottish Parliament, 2003) sets the arm
	 * width at 1/5 to 1/3 of the field; a bare thin-line X undersells that
	 * — it reads as a generic cross, not specifically the Saltire. This
	 * draws two solid bands at 1/5 width, rotated ±45° about the centre and
	 * clipped to the field, rather than a stroked line.
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
	<defs>
		<clipPath id="saltire-field">
			<rect x="0" y="0" width="12" height="12" />
		</clipPath>
	</defs>
	<g clip-path="url(#saltire-field)" fill="currentColor">
		<!-- Field outline, so the mark reads as a flag, not a loose X. -->
		<rect x="0.5" y="0.5" width="11" height="11" fill="none" stroke="currentColor" stroke-width="0.5" />
		<!-- Two bands, each 1/5 of the field, corner to corner. -->
		<rect x="-5" y="4.8" width="22" height="2.4" transform="rotate(45 6 6)" />
		<rect x="-5" y="4.8" width="22" height="2.4" transform="rotate(-45 6 6)" />
	</g>
</svg>
