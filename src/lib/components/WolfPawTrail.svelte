<script lang="ts">
	import { wolfMode } from '$lib/stores/wolfMode';

	const prints = [
		{ left: 4, top: 84, size: 42, rotation: -24, delay: 0 },
		{ left: 13, top: 70, size: 36, rotation: 18, delay: 90 },
		{ left: 8, top: 53, size: 40, rotation: -18, delay: 180 },
		{ left: 18, top: 38, size: 34, rotation: 22, delay: 270 },
		{ left: 12, top: 21, size: 38, rotation: -14, delay: 360 },
		{ left: 23, top: 7, size: 32, rotation: 20, delay: 450 },
		{ left: 91, top: 76, size: 34, rotation: 26, delay: 180 },
		{ left: 84, top: 61, size: 30, rotation: -18, delay: 270 }
	];
</script>

<!--
	Track geometry adapted from "Wolf Paw Print" by Christian Pietzsch, CC0 1.0.
	Source: https://commons.wikimedia.org/wiki/File:Wolf_Paw_Print.svg
-->
<svg class="paw-definitions" aria-hidden="true">
	<defs>
		<symbol id="wolf-paw-print" viewBox="0 0 55.965061 67.624741">
			<g transform="translate(-289.27468 167.88033)">
				<g transform="matrix(0.87438197 -0.14310247 0.12437818 0.86697169 202.59687 -229.96194)">
					<path d="m124.58945 92.289722c-1.08264-.01623-1.49028 7.811598.55653 10.125878.53782.60808 1.64049.45109 1.96835-.26919 1.24417-2.736623-1.68243-9.843397-2.52477-9.85603Z" />
					<path d="m106.41036 91.057783c-.82878-.356588-3.3734 5.992785-2.45731 8.55693.2407.673737 1.13427.893297 1.59197.400877 1.73765-1.870577 1.51009-8.680009.86527-8.957446Z" />
					<path d="m85.095156 111.30738c-1.17739.12097-2.481126 7.33292-.505979 9.19328.518976.48882 1.737203.20689 2.1734-.4934 1.655675-2.6595-.751346-8.79363-1.667392-8.69953Z" />
					<path d="m126.00747 151.27473c-2.8487-2.90103-.90017-8.30243-3.48252-11.30163-1.99401-2.31589-5.25249-3.55362-8.3166-4.05553-2.47487-.40539-5.27179-.2333-7.49549.94751-3.54008 1.87979-5.17273 6.05907-7.860645 9.00188-1.890075 2.06932-4.727419 3.52263-5.810154 6.08282-1.429097 3.37918-2.211928 7.7973-.344479 10.91912 1.063321 1.77755 3.554572 2.42053 5.610246 2.83346 3.338732.67066 6.825142-1.1754 10.201142-.72252 3.11778.41824 5.78602 1.98419 8.89785 3.12465 5.8264.65423 8.31502-.51519 10.23628-3.52486 2.43676-3.81722 2.37471-9.22088-1.63563-13.3049Z" />
					<path d="m140.16638 143.74566c4.48225-3.80153 5.23432-15.74851-.45903-17.38946-6.15666-1.77448-13.38071 9.75957-10.86742 15.52923 1.49899 3.44116 8.43559 4.31207 11.32645 1.86023Z" />
					<path d="m132.05915 112.71773c-1.08866-2.599-2.48778-5.62856-5.63932-6.01161-3.93487-.16161-5.65083 2.91817-6.72088 5.50807-1.40798 4.93676-1.80086 14.15154 4.10664 14.97914 8.96774 1.25633 10.91274-6.28883 8.25356-14.4756Z" />
					<path d="m110.07907 122.89217c3.61568-5.51984-1.98086-18.63169-8.56727-18.24617-6.036541.35333-6.573299 14.66315-5.230925 17.48864 3.23792 5.47163 11.279375 4.60286 13.798195.75753Z" />
					<path d="m84.217588 124.68852c-5.486061 1.92329-4.033517 13.69531.417159 17.43529 2.975721 2.50054 10.069225 1.86835 11.531046-1.73314 2.473583-6.09416-5.741529-17.87808-11.948205-15.70215Z" />
					<path d="m141.11367 113.02284c-1.04392-.1266-2.95867 7.43775-1.42863 9.89601.40202.64592 1.49896.60624 1.95597-.0603 1.73487-2.53175.28482-9.7368-.52736-9.8353Z" />
				</g>
			</g>
		</symbol>
	</defs>
</svg>

<div class="paw-trail" class:wolf-active={$wolfMode} aria-hidden="true">
	{#each prints as print, index}
		<svg
			class="paw"
			class:secondary={index > 5}
			viewBox="0 0 55.965061 67.624741"
			style:left={`${print.left}%`}
			style:top={`${print.top}%`}
			style:width={`${print.size}px`}
			style:--paw-rotation={`${print.rotation}deg`}
			style:--paw-delay={`${print.delay}ms`}
		>
			<use href="#wolf-paw-print" />
		</svg>
	{/each}
</div>

<style>
	.paw-definitions {
		position: absolute;
		width: 0;
		height: 0;
		overflow: hidden;
	}

	.paw-trail {
		position: fixed;
		inset: 0;
		z-index: -1;
		overflow: hidden;
		pointer-events: none;
		color: var(--color-primary-500);
		opacity: 0.055;
		transition: opacity 600ms ease;
	}

	.paw-trail.wolf-active {
		opacity: 0.15;
	}

	.paw {
		position: absolute;
		height: auto;
		fill: currentColor;
		filter: blur(0.2px);
		transform-origin: center;
		animation: paw-arrive 420ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
		animation-delay: var(--paw-delay);
	}

	@keyframes paw-arrive {
		from {
			opacity: 0;
			transform: translateY(10px) rotate(var(--paw-rotation)) scale(0.82);
		}
		to {
			opacity: 1;
			transform: translateY(0) rotate(var(--paw-rotation)) scale(1);
		}
	}

	@media (max-width: 700px) {
		.paw-trail {
			opacity: 0.045;
		}

		.paw-trail.wolf-active {
			opacity: 0.11;
		}

		.paw:nth-child(even),
		.paw.secondary {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.paw-trail {
			transition: none;
		}

		.paw {
			animation: none;
			transform: rotate(var(--paw-rotation));
		}
	}
</style>
