<script lang="ts">
	import { Search } from '@lucide/svelte';

	interface Props {
		value: string;
		placeholder?: string;
		resultCount?: number;
	}

	let { value = $bindable(), placeholder = 'Search...', resultCount }: Props = $props();
</script>

<div role="search">
	<label for="search-input" class="sr-only">Search</label>
	<div class="relative">
		<Search
			class="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-ink-500 dark:text-ink-400"
			aria-hidden="true"
		/>
		<input
			id="search-input"
			type="search"
			{placeholder}
			bind:value
			class="w-full rounded-lg border-2 border-canvas-300 bg-canvas-100 py-3 pr-4 pl-11 text-ink-900 placeholder-ink-500 transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none dark:border-canvas-700 dark:bg-canvas-900 dark:text-ink-50 dark:placeholder-ink-400 dark:focus:border-primary-400"
			aria-label="Search"
			autocomplete="off"
		/>
	</div>
	{#if value && resultCount !== undefined}
		<p class="mt-2 text-sm text-ink-600 dark:text-ink-300" role="status" aria-live="polite">
			Found {resultCount}
			{resultCount === 1 ? 'result' : 'results'}
		</p>
	{/if}
</div>
