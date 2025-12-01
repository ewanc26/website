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

<div class="mb-8" role="tablist" aria-label="Content tabs">
	<div class="flex flex-wrap gap-2">
		{#each tabs as tab, index}
			<button
				onclick={() => onTabChange(tab.id)}
				role="tab"
				aria-selected={activeTab === tab.id}
				aria-controls="{tab.id}-panel"
				id="{tab.id}-tab"
				tabindex={activeTab === tab.id ? 0 : -1}
				class="rounded-full px-4 py-2 text-sm font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 {activeTab ===
				tab.id
					? 'bg-primary-500 text-white shadow-md dark:bg-primary-400'
					: 'bg-canvas-200 text-ink-700 hover:bg-canvas-300 focus-visible:bg-canvas-300 dark:bg-canvas-800 dark:text-ink-200 dark:hover:bg-canvas-700 dark:focus-visible:bg-canvas-700'}"
			>
				{tab.label}
			</button>
		{/each}
	</div>
</div>
