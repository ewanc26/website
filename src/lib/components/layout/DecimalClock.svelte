<script lang="ts">
	import { onMount } from 'svelte';
	import DecimalClockInfoBox from './DecimalClockInfoBox.svelte';

	let decimalTime = $state({ hours: '00', minutes: '00', seconds: '00' });
	let traditionalTime = $state('00:00:00');
	let mounted = $state(false);
	let showInfoBox = $state(false);

	function updateDecimalTime() {
		const now = new Date();
		const totalSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
		const totalMilliseconds = totalSeconds * 1000 + now.getMilliseconds();

		// French Revolutionary decimal time:
		// Day divided into 10 hours (0-9)
		// Each hour divided into 100 minutes (0-99)
		// Each minute divided into 100 seconds (0-99)
		const dayProgress = totalMilliseconds / 86400000;

		// Decimal hours (0-9)
		const decimalHours = dayProgress * 10;
		const hours = Math.floor(decimalHours).toString().padStart(2, '0');

		// Decimal minutes (0-99)
		const minuteProgress = (decimalHours % 1) * 100;
		const minutes = Math.floor(minuteProgress).toString().padStart(2, '0');

		// Decimal seconds (0-99)
		const secondProgress = (minuteProgress % 1) * 100;
		const seconds = Math.floor(secondProgress).toString().padStart(2, '0');

		decimalTime = { hours, minutes, seconds };

		// Traditional time
		const h = now.getHours().toString().padStart(2, '0');
		const m = now.getMinutes().toString().padStart(2, '0');
		const s = now.getSeconds().toString().padStart(2, '0');
		traditionalTime = `${h}:${m}:${s}`;
	}

	onMount(() => {
		updateDecimalTime();
		mounted = true;

		const interval = setInterval(updateDecimalTime, 100);

		return () => {
			clearInterval(interval);
		};
	});

	function toggleInfoBox() {
		showInfoBox = !showInfoBox;
	}

	function closeInfoBox() {
		showInfoBox = false;
	}
</script>

<button
	type="button"
	onclick={toggleInfoBox}
	class="hidden items-center gap-2 rounded-lg bg-canvas-200 px-3 py-2 text-ink-900 transition-colors hover:bg-canvas-300 md:flex dark:bg-canvas-800 dark:text-ink-50 dark:hover:bg-canvas-700"
	title="French Revolutionary Decimal Time with Traditional Time - Click for info"
	aria-label="Decimal clock showing hour {decimalTime.hours}, {decimalTime.minutes} minutes, {decimalTime.seconds} seconds. Traditional time: {traditionalTime}. Click to learn more."
>
	{#if mounted}
		<div class="flex flex-col">
			<div class="flex items-baseline gap-1 font-mono text-sm font-medium leading-tight">
				<span class="tabular-nums">{decimalTime.hours}</span>
				<span class="text-ink-600 dark:text-ink-400">:</span>
				<span class="tabular-nums">{decimalTime.minutes}</span>
				<span class="text-ink-600 dark:text-ink-400">:</span>
				<span class="tabular-nums">{decimalTime.seconds}</span>
			</div>
			<div class="font-mono text-[10px] leading-tight text-ink-600 dark:text-ink-400">
				{traditionalTime}
			</div>
		</div>
	{:else}
		<div class="h-9 w-24 animate-pulse rounded bg-canvas-300 dark:bg-canvas-700"></div>
	{/if}
</button>

<DecimalClockInfoBox show={showInfoBox} onClose={closeInfoBox} />
