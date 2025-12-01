<script lang="ts">
	import { ChevronDown } from '@lucide/svelte';

	interface Option {
		value: string;
		label: string;
	}

	interface Props {
		options: Option[];
		value: string;
		label?: string;
		placeholder?: string;
		id?: string;
	}

	let {
		options,
		value = $bindable(),
		label,
		placeholder = 'Select...',
		id = 'dropdown'
	}: Props = $props();
</script>

<div class="relative">
	{#if label}
		<label for={id} class="mb-2 block text-sm font-medium text-ink-700 dark:text-ink-200">
			{label}
		</label>
	{/if}
	<div class="relative">
		<select
			{id}
			bind:value
			class="w-full appearance-none rounded-lg border-2 border-canvas-300 bg-canvas-100 py-2 pr-10 pl-3 text-ink-900 transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none dark:border-canvas-700 dark:bg-canvas-900 dark:text-ink-50 dark:focus:border-primary-400"
			aria-label={label || 'Select an option'}
		>
			<option value="" disabled>{placeholder}</option>
			{#each options as option}
				<option value={option.value}>{option.label}</option>
			{/each}
		</select>
		<div
			class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink-500 dark:text-ink-400"
			aria-hidden="true"
		>
			<ChevronDown class="h-5 w-5" />
		</div>
	</div>
</div>
