<script lang="ts">
	import { onMount } from 'svelte';
	import { Clock } from '@lucide/svelte';
	import DecimalClockInfoBox from './DecimalClockInfoBox.svelte';

	let decimalTime = $state({ hours: '00', minutes: '00' });
	let mounted = $state(false);
	let showInfoBox = $state(false);
	let intervalId: ReturnType<typeof setInterval> | null = null;
	let isVisible = $state(false);

	function updateDecimalTime() {
		const now = new Date();
		const totalSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
		const totalMilliseconds = totalSeconds * 1000 + now.getMilliseconds();

		// French Revolutionary decimal time:
		// Day divided into 10 hours (0-9)
		// Each hour divided into 100 minutes (0-99)
		const dayProgress = totalMilliseconds / 86400000;

		// Decimal hours (0-9)
		const decimalHours = dayProgress * 10;
		const hours = Math.floor(decimalHours).toString().padStart(2, '0');

		// Decimal minutes (0-99)
		const minuteProgress = (decimalHours % 1) * 100;
		const minutes = Math.floor(minuteProgress).toString().padStart(2, '0');

		decimalTime = { hours, minutes };
	}

	function startInterval() {
		if (!intervalId) {
			intervalId = setInterval(updateDecimalTime, 100);
		}
	}

	function stopInterval() {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
	}

	onMount(() => {
		updateDecimalTime();
		mounted = true;

		// Use IntersectionObserver to detect when clock is visible
		const clockElement = document.querySelector('[data-decimal-clock]');
		if (clockElement) {
			const observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						isVisible = entry.isIntersecting;
						if (entry.isIntersecting) {
							updateDecimalTime();
							startInterval();
						} else {
							stopInterval();
						}
					});
				},
				{ threshold: 0 }
			);

			observer.observe(clockElement);

			return () => {
				observer.disconnect();
				stopInterval();
			};
		}

		return () => {
			stopInterval();
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
	data-decimal-clock
	onclick={toggleInfoBox}
	class="hidden items-center gap-2 rounded-lg bg-canvas-200 px-3 py-2 text-ink-900 transition-colors hover:bg-canvas-300 md:flex dark:bg-canvas-800 dark:text-ink-50 dark:hover:bg-canvas-700"
	title="French Revolutionary Decimal Time - Click for info"
	aria-label="Decimal clock showing {decimalTime.hours} hours and {decimalTime.minutes} minutes. Click to learn more."
>
	<div class="flex items-center gap-0.5" aria-hidden="true">
		<Clock class="h-4 w-4 shrink-0" />
		<span class="text-xs font-bold text-primary-600 dark:text-primary-400">10</span>
	</div>
	{#if mounted}
		<div class="flex items-baseline gap-1 font-mono text-sm font-medium">
			<span class="tabular-nums">{decimalTime.hours}</span>
			<span class="text-ink-600 dark:text-ink-400">:</span>
			<span class="tabular-nums">{decimalTime.minutes}</span>
		</div>
	{:else}
		<div class="h-5 w-16 animate-pulse rounded bg-canvas-300 dark:bg-canvas-700"></div>
	{/if}
</button>

<DecimalClockInfoBox show={showInfoBox} onClose={closeInfoBox} />
