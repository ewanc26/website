<script lang="ts">
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
		style="fill:none;stroke:currentColor;stroke-width:.60000002;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-opacity:1"
		d="M11 6A5 5 0 1 0 1 6a5 5 0 0 0 10 0ZM6 1l2.936 9.048-7.692-5.595h9.512l-7.692 5.595Z"
	/>
</svg>
