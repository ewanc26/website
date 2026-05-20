<script lang="ts">
	import { onMount } from 'svelte';
	import { Pentacle, Triskele } from '$lib/components/ui';

	interface SymbolDef {
		type: 'pentacle' | 'triskele';
		/** Tailwind positioning classes (absolute + placement) */
		pos: string;
		/** Parallax depth — higher = moves more with cursor/scroll */
		depth: number;
		/** Float animation class */
		anim: string;
		/** CSS animation-delay value (negative to start mid-cycle) */
		delay: string;
		/** Tailwind opacity value e.g. "0.04" */
		opacity: string;
		/** Pentacle: pixel size passed to the size prop */
		size?: number;
		/** Triskele: Tailwind h-* w-* sizing classes */
		sz?: string;
	}

	const SYMBOLS: SymbolDef[] = [
		// Top-right — large pentacle
		{
			type: 'pentacle',
			size: 220,
			pos: 'absolute -right-8 top-16',
			depth: 0.018,
			anim: 'animate-float-a',
			delay: '0s',
			opacity: '0.04'
		},
		// Bottom-left — large triskele
		{
			type: 'triskele',
			sz: 'h-64 w-64',
			pos: 'absolute -bottom-12 -left-10',
			depth: 0.012,
			anim: 'animate-float-b',
			delay: '0s',
			opacity: '0.04'
		},
		// Top-left — medium triskele
		{
			type: 'triskele',
			sz: 'h-40 w-40',
			pos: 'absolute -left-6 top-[8%]',
			depth: 0.022,
			anim: 'animate-float-a',
			delay: '-14s',
			opacity: '0.03'
		},
		// Bottom-right — small pentacle
		{
			type: 'pentacle',
			size: 90,
			pos: 'absolute bottom-24 right-10',
			depth: 0.03,
			anim: 'animate-float-b',
			delay: '-8s',
			opacity: '0.05'
		},
		// Mid-left — medium pentacle
		{
			type: 'pentacle',
			size: 150,
			pos: 'absolute left-6 top-[42%]',
			depth: 0.015,
			anim: 'animate-float-b',
			delay: '-5s',
			opacity: '0.03'
		},
		// Mid-right — small triskele
		{
			type: 'triskele',
			sz: 'h-28 w-28',
			pos: 'absolute right-14 top-[38%]',
			depth: 0.028,
			anim: 'animate-float-a',
			delay: '-19s',
			opacity: '0.05'
		},
		// Upper-centre — small pentacle
		{
			type: 'pentacle',
			size: 64,
			pos: 'absolute left-[46%] top-[6%]',
			depth: 0.02,
			anim: 'animate-float-a',
			delay: '-11s',
			opacity: '0.04'
		},
		// Lower-centre — tiny triskele
		{
			type: 'triskele',
			sz: 'h-20 w-20',
			pos: 'absolute bottom-[14%] left-[32%]',
			depth: 0.025,
			anim: 'animate-float-b',
			delay: '-3s',
			opacity: '0.035'
		}
	];

	// Lerped cursor offset, normalised to [-0.5, 0.5] relative to viewport centre
	let curX = $state(0);
	let curY = $state(0);
	// Raw scroll position
	let scrollY = $state(0);

	/** Compute the parallax translate string for a given depth */
	function parallax(depth: number): string {
		const CURSOR_SCALE = 80; // max px offset at the screen edge
		const SCROLL_SCALE = 0.18; // px of vertical offset per scrolled px
		const px = (curX * depth * CURSOR_SCALE).toFixed(2);
		const py = (curY * depth * CURSOR_SCALE - scrollY * depth * SCROLL_SCALE).toFixed(2);
		return `transform: translate(${px}px, ${py}px)`;
	}

	onMount(() => {
		let rafId: number;
		let targetX = 0;
		let targetY = 0;
		const LERP = 0.045; // smoothing factor — lower = lazier

		function onMouseMove(e: MouseEvent) {
			targetX = e.clientX / window.innerWidth - 0.5;
			targetY = e.clientY / window.innerHeight - 0.5;
		}

		function onScroll() {
			scrollY = window.scrollY;
		}

		function tick() {
			// Exponential lerp toward the cursor target
			curX += (targetX - curX) * LERP;
			curY += (targetY - curY) * LERP;
			rafId = requestAnimationFrame(tick);
		}

		window.addEventListener('mousemove', onMouseMove, { passive: true });
		window.addEventListener('scroll', onScroll, { passive: true });
		rafId = requestAnimationFrame(tick);

		return () => {
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('scroll', onScroll);
			cancelAnimationFrame(rafId);
		};
	});
</script>

<!--
  Each symbol is two wrapper levels:
    Outer div — absolute position + CSS float animation (translateY/rotate)
    Inner div — JS parallax transform (translate)
  Keeping them separate prevents the inline style from clobbering the keyframe transform.
-->
<div class="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
	{#each SYMBOLS as s}
		<div class="{s.pos} {s.anim}" style="animation-delay: {s.delay}">
			<div style={parallax(s.depth)}>
				{#if s.type === 'pentacle'}
					<Pentacle
						size={s.size}
						class="text-ink-900 dark:text-ink-50"
						style="opacity: {s.opacity}"
					/>
				{:else}
					<Triskele class="{s.sz} text-ink-900 dark:text-ink-50" style="opacity: {s.opacity}" />
				{/if}
			</div>
		</div>
	{/each}
</div>
