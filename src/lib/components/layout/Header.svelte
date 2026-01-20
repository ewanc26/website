<script lang="ts">
	import { onMount } from 'svelte';
	import { getStores } from '$app/stores';
	import { Menu, X, Check } from '@lucide/svelte';
	import * as LucideIcons from '@lucide/svelte';
	import ThemeToggle from './ThemeToggle.svelte';
	import WolfToggle from './WolfToggle.svelte';
	import ColorThemeToggle from './ColorThemeToggle.svelte';
	import { navItems } from '$lib/data/navItems';
	import type { ProfileData } from '$lib/services/atproto';
	import { defaultSiteMeta, createSiteMeta, type SiteMetadata } from '$lib/helper/siteMeta';
	import { colorThemeDropdownOpen } from '$lib/stores/dropdownState';
	import { colorTheme, type ColorTheme } from '$lib/stores/colorTheme';
	import { getThemesByCategory, CATEGORY_LABELS } from '$lib/config/themes.config';

	interface Props {
		profile?: ProfileData | null;
	}

	let { profile = null }: Props = $props();

	const siteMeta: SiteMetadata = createSiteMeta(defaultSiteMeta);
	const { page } = getStores();

	let imageLoaded = $state(false);
	let mobileMenuOpen = $state(false);
	let colorThemeOpen = $state(false);
	let currentTheme = $state<ColorTheme>('slate');

	// Get themes organized by category
	const themesByCategory = getThemesByCategory();
	type Category = keyof typeof CATEGORY_LABELS;

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
		// Close color theme dropdown when opening mobile menu
		if (mobileMenuOpen) {
			colorThemeDropdownOpen.set(false);
		}
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}

	function closeColorThemeDropdown() {
		colorThemeDropdownOpen.set(false);
	}

	function selectTheme(theme: ColorTheme) {
		colorTheme.setTheme(theme);
		closeColorThemeDropdown();
	}

	function isActive(href: string) {
		return $page.url.pathname === href;
	}

	onMount(() => {
		// Subscribe to color theme state
		const unsubTheme = colorTheme.subscribe((state) => {
			currentTheme = state.current;
		});

		// Subscribe to color theme dropdown state
		const unsubDropdown = colorThemeDropdownOpen.subscribe((open) => {
			colorThemeOpen = open;
			// Close mobile menu when opening color theme dropdown
			if (open) {
				mobileMenuOpen = false;
			}
		});

		// Close mobile menus on Escape key
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				if (mobileMenuOpen) {
					closeMobileMenu();
				}
				if (colorThemeOpen && window.innerWidth < 768) {
					closeColorThemeDropdown();
				}
			}
		};
		document.addEventListener('keydown', handleEscape);

		return () => {
			unsubTheme();
			unsubDropdown();
			document.removeEventListener('keydown', handleEscape);
		};
	});
</script>

<header
	class="sticky top-0 z-50 w-full border-b border-canvas-200 bg-canvas-50/90 backdrop-blur-md dark:border-canvas-800 dark:bg-canvas-950/90"
>
	<nav
		class="container mx-auto flex items-center justify-between px-3 py-3 sm:px-4 sm:py-4"
		aria-label="Main navigation"
	>
		<!-- Logo/Avatar with hover title -->
		<a
			href="/"
			class="group relative flex min-w-0 shrink items-center"
			onclick={closeMobileMenu}
			aria-label="Home - {siteMeta.title}"
		>
			<div class="relative flex items-center">
				{#if profile?.avatar}
					<img
						src={profile.avatar}
						alt=""
						class="h-10 w-10 rounded-full object-cover"
						onload={() => (imageLoaded = true)}
					/>
				{:else if profile}
					<div
						class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-200 font-bold text-primary-800 dark:bg-primary-800 dark:text-primary-200"
						role="img"
						aria-label="{profile.displayName || profile.handle} avatar"
					>
						{(profile.displayName || profile.handle).charAt(0).toUpperCase()}
					</div>
				{:else}
					<div
						class="h-10 w-10 animate-pulse rounded-full bg-canvas-300 dark:bg-canvas-700"
						role="status"
						aria-label="Loading profile"
					></div>
				{/if}
			</div>
			<!-- Site title revealed on hover -->
			<span
				class="ml-2 truncate text-lg font-bold text-ink-900 opacity-0 transition-all duration-300 group-hover:opacity-100 sm:ml-3 dark:text-ink-50"
				aria-hidden="true"
			>
				{siteMeta.title}
			</span>
		</a>

		<!-- Right side: Navigation + Toggles -->
		<div class="hidden items-center gap-4 md:flex">
			<ul class="flex items-center gap-6" role="list">
				{#each navItems as item}
					{@const IconComponent = iconComponents[item.href]}
					<li>
						<a
							href={item.href}
							class="group flex items-center gap-2 font-medium transition-colors
								{isActive(item.href) ? 'text-primary-600 dark:text-primary-400' : 'text-ink-700 dark:text-ink-200'}
								hover:text-primary-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
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

			<!-- Desktop Toggles -->
			<div class="flex items-center gap-2">
				<ColorThemeToggle />
				<WolfToggle />
				<ThemeToggle />
			</div>
		</div>

		<!-- Mobile Menu Button + Toggles -->
		<div class="flex items-center gap-2 md:hidden">
			<ColorThemeToggle />
			<WolfToggle />
			<ThemeToggle />
			<button
				onclick={toggleMobileMenu}
				class="flex h-9 w-9 items-center justify-center rounded-lg text-ink-700 transition-colors hover:bg-canvas-100 focus-visible:bg-canvas-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 dark:text-ink-200 dark:hover:bg-canvas-900 dark:focus-visible:bg-canvas-900"
				aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
				aria-expanded={mobileMenuOpen}
				aria-controls="mobile-menu"
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
		<nav
			id="mobile-menu"
			class="border-t border-canvas-200 bg-canvas-50 md:hidden dark:border-canvas-800 dark:bg-canvas-950"
			aria-label="Mobile navigation"
		>
			<ul class="container mx-auto flex flex-col px-3 py-2" role="list">
				{#each navItems as item}
					{@const IconComponent = iconComponents[item.href]}
					<li>
						<a
							href={item.href}
							onclick={closeMobileMenu}
							class="flex items-center gap-3 rounded-lg px-3 py-3 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600
								{isActive(item.href)
								? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
								: 'text-ink-700 hover:bg-canvas-100 focus-visible:bg-canvas-100 dark:text-ink-200 dark:hover:bg-canvas-900 dark:focus-visible:bg-canvas-900'}"
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
		</nav>
	{/if}

	<!-- Mobile Colour Theme Dropdown -->
	{#if colorThemeOpen}
		<nav
			id="color-theme-menu"
			class="border-t border-canvas-200 bg-canvas-50 md:hidden dark:border-canvas-800 dark:bg-canvas-950"
			aria-label="Colour theme menu"
		>
			<div class="container mx-auto flex flex-col px-3 py-2">
				{#each Object.entries(themesByCategory) as [category, categoryThemes]}
					<div class="mb-4 last:mb-0">
						<div
							class="mb-2 px-3 text-xs font-semibold tracking-wide text-ink-600 uppercase dark:text-ink-400"
						>
							{CATEGORY_LABELS[category as Category]}
						</div>
						<div class="space-y-1">
							{#each categoryThemes as theme}
								<button
									onclick={() => selectTheme(theme.value as ColorTheme)}
									class="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600
										{currentTheme === theme.value
										? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
										: 'text-ink-700 hover:bg-canvas-100 focus-visible:bg-canvas-100 dark:text-ink-200 dark:hover:bg-canvas-900 dark:focus-visible:bg-canvas-900'}"
									role="menuitem"
									aria-current={currentTheme === theme.value ? 'true' : undefined}
								>
									<div
										class="h-7 w-7 shrink-0 rounded-md border border-canvas-300 shadow-sm dark:border-canvas-700"
										style="background-color: {theme.color}"
										aria-hidden="true"
									></div>
									<div class="min-w-0 flex-1">
										<div
											class="font-medium {currentTheme === theme.value
												? ''
												: 'text-ink-900 dark:text-ink-50'}"
										>
											{theme.label}
										</div>
										<div class="text-sm text-ink-600 dark:text-ink-400">
											{theme.description}
										</div>
									</div>
									{#if currentTheme === theme.value}
										<Check
											class="h-5 w-5 shrink-0 text-primary-600 dark:text-primary-400"
											aria-hidden="true"
										/>
									{/if}
								</button>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</nav>
	{/if}
</header>
