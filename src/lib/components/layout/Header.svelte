<script lang="ts">
	import { getStores } from '$app/stores';
	import { createSiteMeta, type SiteMetadata } from '$lib/helper/siteMeta';
	import { defaultSiteMeta } from '$lib/helper/siteMeta';
	import type { NavItem } from '$lib/data/navItems';
	import { navItems } from '$lib/data/navItems';
	import ThemeToggle from './ThemeToggle.svelte';
	import WolfToggle from './WolfToggle.svelte';
	import { Menu, X } from '@lucide/svelte';
	import * as LucideIcons from '@lucide/svelte';

	const siteMeta: SiteMetadata = createSiteMeta(defaultSiteMeta);
	const { page } = getStores();

	let mobileMenuOpen = $state(false);

	// Map of icon names to Lucide components
	let iconComponents: Record<string, any> = {};
	navItems.forEach((item) => {
		const iconName = item.iconPath;
		if (iconName && (LucideIcons as any)[iconName]) {
			iconComponents[item.href] = (LucideIcons as any)[iconName];
		}
	});

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}

	// Check if a nav item is active
	function isActive(href: string): boolean {
		return $page.url.pathname === href;
	}
</script>

<header
	class="sticky top-0 z-50 w-full border-b border-canvas-200 bg-canvas-50/90 backdrop-blur-md dark:border-canvas-800 dark:bg-canvas-950/90"
>
	<nav
		class="container mx-auto flex items-center justify-between px-3 py-3 sm:px-4 sm:py-4"
		aria-label="Main navigation"
	>
		<!-- Logo/Brand -->
		<a href="/" class="group flex min-w-0 shrink items-center gap-2" onclick={closeMobileMenu}>
			<span
				class="truncate text-lg font-bold text-ink-900 sm:text-xl dark:text-ink-50"
				style="max-width: clamp(120px, 30vw, 200px);"
				aria-label="{siteMeta.title} - Home"
			>
				{siteMeta.title}
			</span>
		</a>

		<!-- Desktop Navigation -->
		<div class="hidden items-center gap-4 md:flex">
			<ul class="flex items-center gap-6">
				{#each navItems as item}
					{@const IconComponent = iconComponents[item.href]}
					<li>
						<a
							href={item.href}
							class="group flex items-center gap-2 font-medium transition-colors
								{isActive(item.href) ? 'text-primary-600 dark:text-primary-400' : 'text-ink-700 dark:text-ink-200'}
								hover:text-primary-500"
							aria-current={isActive(item.href) ? 'page' : undefined}
							title={item.label}
						>
							{#if IconComponent}
								<IconComponent
									class="h-5 w-5 transition-transform group-hover:scale-110"
									aria-hidden="true"
								/>
							{:else}
								<div class="flex h-5 w-5 items-center justify-center" aria-hidden="true">
									<div class="h-3 w-3 animate-pulse rounded-full bg-primary-500"></div>
								</div>
							{/if}
							<span>{item.label}</span>
						</a>
					</li>
				{/each}
			</ul>
			<div class="flex items-center gap-2">
				<WolfToggle />
				<ThemeToggle />
			</div>
		</div>

		<!-- Mobile Menu Button & Controls -->
		<div class="flex items-center gap-2 md:hidden">
			<WolfToggle />
			<ThemeToggle />
			<button
				onclick={toggleMobileMenu}
				class="flex h-9 w-9 items-center justify-center rounded-lg text-ink-700 transition-colors hover:bg-canvas-100 dark:text-ink-200 dark:hover:bg-canvas-900"
				aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
				aria-expanded={mobileMenuOpen}
			>
				{#if mobileMenuOpen}
					<X class="h-6 w-6" aria-hidden="true" />
				{:else}
					<Menu class="h-6 w-6" aria-hidden="true" />
				{/if}
			</button>
		</div>
	</nav>

	<!-- Mobile Menu Dropdown -->
	{#if mobileMenuOpen}
		<div
			class="border-t border-canvas-200 bg-canvas-50 md:hidden dark:border-canvas-800 dark:bg-canvas-950"
			role="menu"
		>
			<ul class="container mx-auto flex flex-col px-3 py-2">
				{#each navItems as item}
					{@const IconComponent = iconComponents[item.href]}
					<li role="none">
						<a
							href={item.href}
							onclick={closeMobileMenu}
							class="flex items-center gap-3 rounded-lg px-3 py-3 font-medium transition-colors
								{isActive(item.href)
								? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
								: 'text-ink-700 hover:bg-canvas-100 dark:text-ink-200 dark:hover:bg-canvas-900'}"
							role="menuitem"
							aria-current={isActive(item.href) ? 'page' : undefined}
						>
							{#if IconComponent}
								<IconComponent
									class="h-5 w-5 {isActive(item.href)
										? 'text-primary-600 dark:text-primary-400'
										: 'text-ink-600 dark:text-ink-400'}"
									aria-hidden="true"
								/>
							{:else}
								<div class="flex h-5 w-5 items-center justify-center" aria-hidden="true">
									<div class="h-3 w-3 rounded-full bg-primary-500"></div>
								</div>
							{/if}
							<span>{item.label}</span>
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</header>
