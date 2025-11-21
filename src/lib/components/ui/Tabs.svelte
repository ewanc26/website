<script lang="ts">
	interface Tab {
		id: string;
		label: string;
	}

	interface Props {
		tabs: Tab[];
		activeTab: string;
		onTabChange: (tabId: string) => void;
	}

	let { tabs, activeTab, onTabChange }: Props = $props();
</script>

<div class="mb-8 flex flex-wrap gap-2">
	{#each tabs as tab}
		<button
			onclick={() => onTabChange(tab.id)}
			class="rounded-full px-4 py-2 text-sm font-medium transition-all {activeTab === tab.id
				? 'bg-primary-500 text-white shadow-md dark:bg-primary-400'
				: 'bg-canvas-200 text-ink-700 hover:bg-canvas-300 dark:bg-canvas-800 dark:text-ink-200 dark:hover:bg-canvas-700'}"
			aria-current={activeTab === tab.id ? 'page' : undefined}
		>
			{tab.label}
		</button>
	{/each}
</div>
