<script lang="ts">
	import { onMount } from 'svelte';
	import { isVisiblyFullMoon } from '$lib/utils/moonPhase';

	// Easter eggs #11–13, drawn from the blog archive:
	// Full moon: https://blog.ewancroft.uk/3mn5vswt5ksxw
	// Cube of Computing: https://blog.ewancroft.uk/3mptikkp34s2o
	// Against Entropy: https://blog.ewancroft.uk/3mljfql5ydk2i
	let isFullMoon = $state(false);
	let cubeVisible = $state(false);
	let entropyVisible = $state(false);
	let keyBuffer = '';
	let cubeTimer: ReturnType<typeof setTimeout> | null = null;
	let entropyTimer: ReturnType<typeof setTimeout> | null = null;

	function updateMoon() {
		isFullMoon = isVisiblyFullMoon();
	}

	function isWriting(target: EventTarget | null) {
		return target instanceof HTMLElement &&
			(target.isContentEditable || target.matches('input, textarea, select'));
	}

	function revealCube() {
		if (cubeTimer) clearTimeout(cubeTimer);
		cubeVisible = true;
		cubeTimer = setTimeout(() => {
			cubeVisible = false;
			cubeTimer = null;
		}, 6700);
	}

	function resistEntropy() {
		if (entropyTimer) clearTimeout(entropyTimer);
		entropyVisible = true;
		entropyTimer = setTimeout(() => {
			entropyVisible = false;
			entropyTimer = null;
		}, 4200);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.metaKey || event.ctrlKey || event.altKey || event.key.length !== 1 || isWriting(event.target)) {
			return;
		}

		keyBuffer = `${keyBuffer}${event.key.toLowerCase()}`.slice(-12);
		if (keyBuffer.endsWith('cube')) {
			revealCube();
			keyBuffer = '';
		} else if (keyBuffer.endsWith('entropy')) {
			resistEntropy();
			keyBuffer = '';
		}
	}

	onMount(() => {
		updateMoon();
		const moonTimer = setInterval(updateMoon, 60 * 60 * 1000);
		document.addEventListener('keydown', handleKeydown);

		return () => {
			clearInterval(moonTimer);
			document.removeEventListener('keydown', handleKeydown);
			if (cubeTimer) clearTimeout(cubeTimer);
			if (entropyTimer) clearTimeout(entropyTimer);
		};
	});
</script>

<svelte:body class:archive-full-moon={isFullMoon} class:resisting-entropy={entropyVisible} />

{#if isFullMoon}
	<div class="archive-moon" aria-hidden="true">
		<span class="moon-disc"></span>
		<span class="moon-copy">look up</span>
	</div>
{/if}

{#if cubeVisible}
	<div class="mac-arrival" role="status" aria-live="polite">
		<div class="happy-mac" aria-hidden="true">
			<img src="/assets/happy-mac.svg" alt="" />
		</div>
		<span class="archive-status">M4 MINI // CUBE OF COMPUTING // 67 DAYS LATER</span>
	</div>
{/if}

{#if entropyVisible}
	<div class="entropy-status" role="status" aria-live="polite">
		<span>AGAINST ENTROPY</span>
		<strong>STILL HERE.</strong>
	</div>
{/if}

<style>
	.archive-moon {
		position: fixed;
		top: clamp(5rem, 12vh, 8rem);
		right: clamp(1.5rem, 7vw, 8rem);
		z-index: -1;
		display: grid;
		justify-items: center;
		gap: 0.65rem;
		color: oklch(86% 0.025 245);
		opacity: 0.2;
		pointer-events: none;
		animation: moon-rise 1.8s ease-out both;
	}

	.moon-disc {
		display: block;
		width: clamp(3.5rem, 7vw, 6rem);
		aspect-ratio: 1;
		border-radius: 50%;
		background:
			radial-gradient(circle at 34% 38%, oklch(52% 0.018 245 / 0.22) 0 8%, transparent 9%),
			radial-gradient(circle at 68% 60%, oklch(52% 0.018 245 / 0.18) 0 11%, transparent 12%),
			currentColor;
		box-shadow: 0 0 2.5rem oklch(86% 0.025 245 / 0.45);
	}

	.moon-copy {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.mac-arrival {
		position: fixed;
		right: clamp(1rem, 4vw, 3rem);
		bottom: 5.5rem;
		z-index: 9999;
		display: flex;
		align-items: center;
		gap: 1rem;
		max-width: min(24rem, calc(100vw - 2rem));
		padding: 0.85rem 1rem;
		border: 1px solid var(--color-text-200);
		border-radius: var(--radius-md, 6px);
		background: color-mix(in oklch, var(--color-background-50) 90%, transparent);
		color: var(--color-primary-600);
		box-shadow: 0 0.75rem 2rem rgb(0 0 0 / 0.1);
		backdrop-filter: blur(10px);
		pointer-events: none;
		animation:
			archive-in 500ms cubic-bezier(0.2, 0.8, 0.2, 1) both,
			archive-out 400ms ease-in 6.3s forwards;
	}

	.happy-mac {
		width: 2.5rem;
		flex: 0 0 auto;
		filter: drop-shadow(0 0.3rem 0.55rem rgb(0 0 0 / 0.18));
		transform-origin: 50% 100%;
		animation: happy-mac-startup 6.7s ease-in-out infinite;
	}

	.happy-mac img {
		display: block;
		width: 100%;
		height: auto;
		image-rendering: pixelated;
	}

	.archive-status,
	.entropy-status {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		letter-spacing: 0.06em;
		line-height: 1.4;
	}

	.entropy-status {
		position: fixed;
		left: clamp(1rem, 4vw, 3rem);
		bottom: 5.5rem;
		z-index: 9999;
		display: grid;
		gap: 0.15rem;
		padding: 0.75rem 1rem;
		border-left: 2px solid var(--color-primary-500);
		background: color-mix(in oklch, var(--color-background-50) 90%, transparent);
		color: var(--color-text-600);
		backdrop-filter: blur(10px);
		pointer-events: none;
		animation:
			archive-in 350ms ease-out both,
			archive-out 350ms ease-in 3.85s forwards;
	}

	.entropy-status strong {
		color: var(--color-primary-600);
		font-size: 0.8rem;
	}

	:global(body.archive-full-moon .nav-brand svg) {
		filter: drop-shadow(0 0 0.45rem oklch(86% 0.025 245 / 0.5));
	}

	:global(body.resisting-entropy .shell-main) {
		animation: resist-entropy 1.2s steps(1, end) both;
	}

	@keyframes moon-rise {
		from { opacity: 0; transform: translateY(1rem); }
		to { opacity: 0.2; transform: translateY(0); }
	}

	@keyframes happy-mac-startup {
		0% { opacity: 0; transform: translateY(0.35rem) scale(0.88); }
		8%, 88% { opacity: 1; transform: translateY(0) scale(1); }
		92% { transform: translateY(-0.12rem) scale(1.02); }
		100% { opacity: 0; transform: translateY(0) scale(0.96); }
	}

	@keyframes resist-entropy {
		0%, 100% { filter: none; transform: none; }
		18% { filter: blur(1px); transform: translate(1px, -1px) skewX(-0.15deg); }
		31% { filter: blur(0.4px); transform: translate(-1px, 1px); }
		47% { filter: blur(1.5px); transform: translate(1px, 0); }
		64% { filter: blur(0.3px); transform: translate(0, -1px); }
	}

	@keyframes archive-in {
		from { opacity: 0; transform: translateY(0.75rem) scale(0.96); }
		to { opacity: 1; transform: translateY(0) scale(1); }
	}

	@keyframes archive-out {
		to { opacity: 0; transform: translateY(0.35rem) scale(0.98); }
	}

	@media (max-width: 700px) {
		.archive-moon {
			right: 1.25rem;
			opacity: 0.14;
		}

		.archive-status {
			max-width: 13rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.archive-moon,
		.mac-arrival,
		.entropy-status,
		.happy-mac,
		:global(body.resisting-entropy .shell-main) {
			animation: none;
		}
	}
</style>
