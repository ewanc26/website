<script lang="ts">
	import { getStores } from '$app/stores';
	import type { NavItem } from '$lib/data/navItems';
	import * as LucideIcons from '@lucide/svelte';

	const { page } = getStores();
	export let navItems: NavItem[] = [];

	// Map of icon names to Lucide components
	let iconComponents: Record<string, typeof import('svelte').SvelteComponent> = {};
	navItems.forEach((item) => {
		const iconName = item.iconPath;
		if (iconName && (LucideIcons as any)[iconName]) {
			iconComponents[item.href] = (LucideIcons as any)[iconName];
		}
	});
</script>

<ul class="flex items-center gap-6">
	{#each navItems as item}
		<li>
			<a
				href={item.href}
				class="group flex items-center gap-2 font-medium transition-colors
          {$page.url.pathname === item.href
					? 'text-primary-600 dark:text-primary-400'
					: 'text-ink-700 dark:text-ink-200'}
          hover:text-primary-500"
				aria-current={$page.url.pathname === item.href ? 'page' : undefined}
				title={item.label}
			>
				{#if iconComponents[item.href]}
					<svelte:component
						this={iconComponents[item.href]}
						class="h-5 w-5 transition-transform group-hover:scale-110"
						aria-hidden="true"
					/>
				{:else}
					<div class="flex h-5 w-5 items-center justify-center" aria-hidden="true">
						<div class="h-3 w-3 animate-pulse rounded-full bg-primary-500"></div>
					</div>
				{/if}
				<span class="hidden sm:inline">{item.label}</span>
			</a>
		</li>
	{/each}
</ul>
