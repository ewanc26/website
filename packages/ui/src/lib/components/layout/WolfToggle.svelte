<script lang="ts">
	import { wolfMode } from '../../stores/wolfMode.js';

	let isWolfMode = $state(false);
	$effect(() => {
		const unsubscribe = wolfMode.subscribe((value) => { isWolfMode = value; });
		return unsubscribe;
	});
</script>

<button
	onclick={() => wolfMode.toggle()}
	class="relative flex h-10 w-10 items-center justify-center rounded-lg bg-canvas-200 text-ink-900 transition-all hover:bg-canvas-300 dark:bg-canvas-800 dark:text-ink-50 dark:hover:bg-canvas-700"
	aria-label={isWolfMode ? 'Disable wolf mode' : 'Enable wolf mode'}
	type="button"
	title={isWolfMode ? 'Return to normal text' : 'Transform to wolf speak - awoo!'}
>
	<span class="text-2xl transition-transform duration-300 {isWolfMode ? 'scale-125' : 'scale-100'}" aria-hidden="true">🐺</span>
</button>
