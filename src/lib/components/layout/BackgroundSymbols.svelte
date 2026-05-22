<script lang="ts">
	import { onMount } from 'svelte';
	import { Pentacle, Triskele } from '$lib/components/ui';

	interface SymbolDef {
		type: 'pentacle' | 'triskele';
		pos: string;
		depth: number;
		anim: string;
		delay: string;
		opacity: string;
		size?: number;
		sz?: string;
	}

	interface MotionState {
		xSeed: number;
		ySeed: number;
		xFreq: number;
		yFreq: number;
		xAmp: number;
		yAmp: number;
		rotSeed: number;
		rotFreq: number;
	}

	const SYMBOLS: SymbolDef[] = [
		{
			type: 'pentacle',
			size: 220,
			pos: 'absolute -right-8 top-16',
			depth: 0.018,
			anim: 'animate-float-a',
			delay: '0s',
			opacity: '0.04'
		},
		{
			type: 'triskele',
			sz: 'h-64 w-64',
			pos: 'absolute -bottom-12 -left-10',
			depth: 0.012,
			anim: 'animate-float-b',
			delay: '0s',
			opacity: '0.04'
		},
		{
			type: 'triskele',
			sz: 'h-40 w-40',
			pos: 'absolute -left-6 top-[8%]',
			depth: 0.022,
			anim: 'animate-float-a',
			delay: '-14s',
			opacity: '0.03'
		},
		{
			type: 'pentacle',
			size: 90,
			pos: 'absolute bottom-24 right-10',
			depth: 0.03,
			anim: 'animate-float-b',
			delay: '-8s',
			opacity: '0.05'
		},
		{
			type: 'pentacle',
			size: 150,
			pos: 'absolute left-6 top-[42%]',
			depth: 0.015,
			anim: 'animate-float-b',
			delay: '-5s',
			opacity: '0.03'
		},
		{
			type: 'triskele',
			sz: 'h-28 w-28',
			pos: 'absolute right-14 top-[38%]',
			depth: 0.028,
			anim: 'animate-float-a',
			delay: '-19s',
			opacity: '0.05'
		},
		{
			type: 'pentacle',
			size: 64,
			pos: 'absolute left-[46%] top-[6%]',
			depth: 0.02,
			anim: 'animate-float-a',
			delay: '-11s',
			opacity: '0.04'
		},
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

	// Randomised motion profile for every symbol
	const MOTION: MotionState[] = SYMBOLS.map((s) => ({
		xSeed: Math.random() * Math.PI * 2,
		ySeed: Math.random() * Math.PI * 2,

		xFreq: 0.08 + Math.random() * 0.18,
		yFreq: 0.08 + Math.random() * 0.18,

		xAmp: 10 + Math.random() * (40 + s.depth * 1200),
		yAmp: 10 + Math.random() * (40 + s.depth * 1200),

		rotSeed: Math.random() * Math.PI * 2,
		rotFreq: 0.02 + Math.random() * 0.08
	}));

	let curX = $state(0);
	let curY = $state(0);
	let scrollY = $state(0);
	let time = $state(0);

	function parallax(depth: number, index: number): string {
		const CURSOR_SCALE = 80;
		const SCROLL_SCALE = 0.18;

		const px = curX * depth * CURSOR_SCALE;
		const py = curY * depth * CURSOR_SCALE - scrollY * depth * SCROLL_SCALE;

		const t = time * 0.001;
		const m = MOTION[index];

		// Multi-wave procedural motion
		const driftX =
			Math.sin(t * m.xFreq + m.xSeed) * m.xAmp +
			Math.cos(t * (m.xFreq * 0.6) + m.ySeed) * (m.xAmp * 0.4);

		const driftY =
			Math.cos(t * m.yFreq + m.ySeed) * m.yAmp +
			Math.sin(t * (m.yFreq * 0.5) + m.xSeed) * (m.yAmp * 0.35);

		// Slow natural rotation
		const rotation = Math.sin(t * m.rotFreq + m.rotSeed) * 12;

		return `
			transform:
				translate(${(px + driftX).toFixed(2)}px, ${(py + driftY).toFixed(2)}px)
				rotate(${rotation.toFixed(2)}deg)
		`;
	}

	onMount(() => {
		let rafId = 0;

		let targetX = 0;
		let targetY = 0;

		const LERP = 0.045;

		function onMouseMove(e: MouseEvent) {
			targetX = e.clientX / window.innerWidth - 0.5;
			targetY = e.clientY / window.innerHeight - 0.5;
		}

		function onScroll() {
			scrollY = window.scrollY;
		}

		function tick(now: number) {
			time = now;

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

<div class="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
	{#each SYMBOLS as s, i}
		<div class="{s.pos} {s.anim}" style="animation-delay: {s.delay}">
			<div style={parallax(s.depth, i)}>
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
