<script lang="ts">
	import { onMount } from 'svelte';
	import { getStores } from '$app/stores';
	import { Menu, X } from '@lucide/svelte';
	import * as LucideIcons from '@lucide/svelte';
	import ThemeToggle from './ThemeToggle.svelte';
	import WolfToggle from './WolfToggle.svelte';
	import { navItems } from '$lib/data/navItems';
	import { fetchProfile, type ProfileData } from '$lib/services/atproto';
	import { defaultSiteMeta, createSiteMeta, type SiteMetadata } from '$lib/helper/siteMeta';

	const siteMeta: SiteMetadata = createSiteMeta(defaultSiteMeta);
	const { page } = getStores();

	let profile: ProfileData | null = null;
	let loading = true;
	let error: string | null = null;
	let imageLoaded = false;
	let mobileMenuOpen = false;

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

	function isActive(href: string) {
		return $page.url.pathname === href;
	}

	onMount(async () => {
		try {
			profile = await fetchProfile();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load profile';
		} finally {
			loading = false;
		}
	});
</script>

<header class="sticky top-0 z-50 w-full border-b border-canvas-200 bg-canvas-50/90 backdrop-blur-md dark:border-canvas-800 dark:bg-canvas-950/90">
	<nav class="container mx-auto flex items-center justify-between px-3 py-3 sm:px-4 sm:py-4" aria-label="Main navigation">
		<!-- Logo/Avatar with hover title -->
		<a href="/" class="group flex min-w-0 shrink items-center gap-2 relative" onclick={closeMobileMenu}>
			<div class="relative flex items-center">
				{#if profile?.avatar}
					<img
						src={profile.avatar}
						alt={profile.displayName || profile.handle}
						class="h-10 w-10 rounded-full object-cover"
						onload={() => (imageLoaded = true)}
					/>
				{:else if profile}
					<div
						class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-200 text-primary-800 dark:bg-primary-800 dark:text-primary-200 font-bold"
					>
						{(profile.displayName || profile.handle).charAt(0).toUpperCase()}
					</div>
				{:else}
					<div class="h-10 w-10 rounded-full bg-canvas-300 dark:bg-canvas-700 animate-pulse"></div>
				{/if}

				<!-- Site title revealed on hover -->
				<span
					class="absolute left-full top-1/2 -translate-y-1/2 ml-2 truncate opacity-0 transition-all duration-300 group-hover:opacity-100 sm:ml-3 text-lg font-bold text-ink-900 dark:text-ink-50"
				>
					{siteMeta.title}
				</span>
			</div>
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
								<IconComponent class="h-5 w-5 transition-transform group-hover:scale-110" aria-hidden="true" />
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

		<!-- Mobile Menu Button -->
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
		<div class="border-t border-canvas-200 bg-canvas-50 md:hidden dark:border-canvas-800 dark:bg-canvas-950" role="menu">
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
									class="h-5 w-5 {isActive(item.href) ? 'text-primary-600 dark:text-primary-400' : 'text-ink-600 dark:text-ink-400'}"
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
