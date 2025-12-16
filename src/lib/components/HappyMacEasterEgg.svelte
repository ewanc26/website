<script lang="ts">
	import { happyMacStore } from '$lib/stores';

	let isVisible = $state(false);
	let position = $state(-100);

	// Watch the store for when it's triggered (24 clicks)
	$effect(() => {
		const state = $happyMacStore;
		if (state.isTriggered && !isVisible) {
			startAnimation();
		}
	});

	function startAnimation() {
		isVisible = true;
		position = -100;

		// Animate across screen (takes about 15 seconds)
		const duration = 15000;
		const startTime = Date.now();

		function animate() {
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / duration, 1);

			// Move from -100 to window width + 100
			position = -100 + (window.innerWidth + 200) * progress;

			if (progress < 1) {
				requestAnimationFrame(animate);
			} else {
				isVisible = false;
				// Reset the store so it can be triggered again
				happyMacStore.reset();
			}
		}

		requestAnimationFrame(animate);
	}
</script>

{#if isVisible}
	<div
		class="happy-mac"
		style="left: {position}px"
	>
		<!-- 
			Happy Mac SVG
			Original by NiloGlock at Italian Wikipedia
			License: CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/)
			Source: https://commons.wikimedia.org/wiki/File:Happy_Mac.svg
		-->
		<svg
			width="60"
			height="78"
			viewBox="0 0 8.4710464 10.9614"
			xmlns="http://www.w3.org/2000/svg"
			class="mac-icon"
		>
			<g transform="translate(-5.3090212,-4.3002038)">
				<g transform="matrix(0.06455006,0,0,0.06455006,7.6050574,7.0900779)">
					<path d="m -30.937651,99.78759 h 122 v 26.80449 h -122 z" style="fill:#000000;fill-opacity:1;stroke-width:2.38412714"/>
					<g transform="translate(-56.456402,-31.41017)">
						<path style="fill:#555555;fill-opacity:1;stroke:none;stroke-width:0.17674622" d="m 33.668747,136.75006 v 4.69998 h 31.950504 v -4.69998 z m 41.740088,4.69998 V 146.15 h 11.145573 v -4.69996 z M 91.152059,146.15 v 6.29987 H 102.47075 V 146.15 Z"/>
						<path style="fill:#444444;fill-opacity:1;stroke:none;stroke-width:0.15800072" d="m 65.619251,136.75006 v 4.69998 H 86.554408 V 146.15 h 15.916342 v 6.29987 h 20.86023 V 146.15 h -15.87449 v -4.69996 H 91.152059 v -4.69998 z"/>
						<path style="fill:#222222;fill-opacity:1;stroke:none;stroke-width:0.21712606" d="m 91.152059,136.75006 v 4.69998 H 107.45649 V 146.15 h 15.87449 v 6.29987 h 16.03777 v -6.29987 -4.69996 -4.69998 z"/>
						<path style="fill:#777777;fill-opacity:1;stroke:none;stroke-width:0.20201708" d="M 33.668747,141.45004 V 146.15 h 41.740088 v -4.69996 z M 75.408835,146.15 v 6.29987 H 91.152059 V 146.15 Z"/>
						<path d="m 33.668823,146.14999 h 41.74001 v 6.3 h -41.74001 z" style="fill:#888888;fill-opacity:1;stroke:none;stroke-width:0.23388879"/>
					</g>
					<path d="M -30.969854,-37.120319 H 91.062349 V 99.787579 H -30.969854 Z" style="fill:#cccccc;fill-opacity:1;stroke-width:0.26458332"/>
					<path d="M -15.075892,-21.040775 H 74.98512 v 67.75 h -90.061012 z" style="fill:#ccccff;fill-opacity:1;stroke-width:0.26458332"/>
					<path transform="scale(0.26458333)" d="M 102.17383,-23.402344 V 59.882812 H 83.148438 V 78.779297 H 102.17383 120 120.0508 V -23.402344 Z" style="fill:#000000;fill-opacity:1;stroke-width:0.93718952"/>
					<path d="M -30.969856,-43.220318 H 91.062347 v 6.1 H -30.969856 Z" style="fill:#000000;fill-opacity:1;stroke-width:1.13749063"/>
					<path d="M -15.075892,-27.140776 H 74.98512 v 6.1 h -90.061012 z" style="fill:#444444;fill-opacity:1;stroke-width:0.97719014"/>
					<path d="m -21.040775,15.075892 h 67.75 v 6.1 h -67.75 z" style="fill:#444444;fill-opacity:1;stroke-width:0.84755003" transform="rotate(90)"/>
					<path d="m -21.040775,-81.085121 h 67.75 v 6.1 h -67.75 z" style="fill:#ffffff;fill-opacity:1;stroke-width:0.84755009" transform="rotate(90)"/>
					<path d="m -15.07589,46.709225 h 90.061013 v 6.1 H -15.07589 Z" style="fill:#ffffff;fill-opacity:1;stroke-width:0.9771902"/>
					<path d="m 31.655506,73.81324 h 43.400002 v 5 H 31.655506 Z" style="fill:#000000;fill-opacity:1;stroke-width:0.26445001"/>
					<path d="m 31.655506,78.81324 h 43.400005 v 6 H 31.655506 Z" style="fill:#ffffff;fill-opacity:1;stroke-width:0.28969046"/>
					<path d="m -21.133041,73.785721 h 11.060395 v 5 h -11.060395 z" style="fill:#00bb00;fill-opacity:1;stroke-width:0.13350084"/>
					<path d="m -21.133041,78.785721 h 11.060396 v 6 h -11.060396 z" style="fill:#dd0000;fill-opacity:1;stroke-width:0.14624284"/>
					<path d="M 5.8799295,-6.1919641 H 10.87993 V 5.0080357 H 5.8799295 Z" style="fill:#000000;fill-opacity:1;stroke-width:0.26576424"/>
					<path d="m 47.880306,-6.1919641 h 6.1 V 5.0080357 h -6.1 z" style="fill:#000000;fill-opacity:1;stroke-width:0.29354623"/>
					<path d="m 10.8871,25.947487 h 5 v 6 h -5 z" style="fill:#000000;fill-opacity:1;stroke-width:0.19451953"/>
					<path d="m 38.149635,25.944651 h 4.75 v 6.002836 h -4.75 z" style="fill:#000000;fill-opacity:1;stroke-width:0.18963902"/>
					<path d="m 15.8871,31.947487 h 22.262533 v 5.011021 H 15.8871 Z" style="fill:#000000;fill-opacity:1;stroke-width:11.12128639"/>
					<path d="M -37.120319,30.969854 H 99.787579 v 4.6 H -37.120319 Z" style="fill:#000000;fill-opacity:1;stroke-width:1.04625833" transform="rotate(90)"/>
					<path d="M -37.120331,-95.662346 H 99.787582 v 4.6 H -37.120331 Z" style="fill:#000000;fill-opacity:1;stroke-width:1.04625833" transform="rotate(90)"/>
				</g>
			</g>
		</svg>
	</div>
{/if}

<style>
	.happy-mac {
		position: fixed;
		bottom: 0;
		z-index: 9999;
		pointer-events: none;
		animation: hop 0.6s ease-in-out infinite;
	}

	.mac-icon {
		filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
	}

	@keyframes hop {
		0%,
		100% {
			transform: translateY(0) rotate(0deg);
		}
		50% {
			transform: translateY(-20px) rotate(5deg);
		}
	}

	/* Add a little tilt alternation */
	.happy-mac:hover {
		animation: hop 0.3s ease-in-out infinite;
	}
</style>
